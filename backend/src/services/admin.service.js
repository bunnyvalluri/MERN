import { User, USER_ROLES } from '../models/User.model.js';
import { Company } from '../models/Company.model.js';
import { Internship, INTERNSHIP_STATUS } from '../models/Internship.model.js';
import { Application, APPLICATION_STATUS } from '../models/Application.model.js';
import { AuditLog } from '../models/AuditLog.model.js';
import { Notification, NOTIFICATION_TYPES } from '../models/Notification.model.js';
import { ApiError } from '../utils/ApiError.js';

export class AdminService {
  /**
   * 1. Get Platform Dashboard Metrics from real MongoDB collections.
   */
  static async getDashboardMetrics() {
    const [
      totalUsers,
      activeUsers,
      studentsCount,
      recruitersCount,
      companiesCount,
      internshipsCount,
      applicationsCount,
      unverifiedCompanies,
      draftInternships,
      recentLogs,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: USER_ROLES.STUDENT }),
      User.countDocuments({ role: USER_ROLES.RECRUITER }),
      Company.countDocuments(),
      Internship.countDocuments(),
      Application.countDocuments(),
      Company.countDocuments({ verified: false }),
      Internship.countDocuments({ status: INTERNSHIP_STATUS.DRAFT }),
      AuditLog.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .populate('userId', 'name email role')
        .lean(),
    ]);

    const pendingApprovals = unverifiedCompanies + draftInternships;

    // Aggregate monthly user registration trends (past 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const userTrendAgg = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const userGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mNum = d.getMonth() + 1;
      const yNum = d.getFullYear();
      const match = userTrendAgg.find(
        (t) => t._id.year === yNum && t._id.month === mNum
      );
      userGrowth.push({
        label: `${months[mNum - 1]} ${yNum.toString().slice(2)}`,
        count: match ? match.count : 0,
      });
    }

    // Application status distribution
    const statusAgg = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const statusDistribution = Object.values(APPLICATION_STATUS).map((status) => {
      const match = statusAgg.find((s) => s._id === status);
      return {
        status,
        count: match ? match.count : 0,
      };
    });

    return {
      metrics: {
        totalUsers,
        activeUsers,
        studentsCount,
        recruitersCount,
        companiesCount,
        internshipsCount,
        applicationsCount,
        pendingApprovals,
        unverifiedCompanies,
        draftInternships,
      },
      charts: {
        userGrowth,
        statusDistribution,
      },
      recentLogs,
    };
  }

  /**
   * 2. List Users with Search, Filters, and Pagination.
   * Strips passwordHash and session tokens.
   */
  static async getUsers(queryParams = {}) {
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit, 10) || 15));
    const skip = (page - 1) * limit;

    const filter = {};

    if (queryParams.role && queryParams.role !== 'ALL') {
      filter.role = queryParams.role;
    }

    if (queryParams.isActive !== undefined && queryParams.isActive !== 'ALL') {
      filter.isActive = queryParams.isActive === 'true';
    }

    if (queryParams.isVerified !== undefined && queryParams.isVerified !== 'ALL') {
      filter.isVerified = queryParams.isVerified === 'true';
    }

    if (queryParams.search) {
      const searchRegex = new RegExp(queryParams.search.trim(), 'i');
      filter.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-passwordHash -refreshToken -passwordResetToken -verificationToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return {
      data: users,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * 3. Activate or Deactivate User Account.
   */
  static async updateUserStatus(userId, { isActive }, adminUser, auditInfo = {}) {
    if (userId.toString() === adminUser._id.toString() && !isActive) {
      throw new ApiError(400, 'You cannot deactivate your own administrative account.');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found.');
    }

    user.isActive = Boolean(isActive);
    if (!isActive) {
      user.refreshToken = null; // Revoke active sessions immediately
    }
    await user.save();

    const actionName = isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED';

    await AuditLog.create({
      userId: adminUser._id,
      action: actionName,
      resource: 'User',
      resourceId: user._id,
      ipAddress: auditInfo.ipAddress || null,
      userAgent: auditInfo.userAgent || null,
      metadata: {
        targetUserId: user._id,
        targetEmail: user.email,
        newStatus: user.isActive,
      },
    });

    return {
      success: true,
      message: `User ${user.name} was successfully ${isActive ? 'activated' : 'deactivated'}.`,
      user: user.toJSON(),
    };
  }

  /**
   * 4. List Companies with Owner and Internship counts.
   */
  static async getCompanies(queryParams = {}) {
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit, 10) || 15));
    const skip = (page - 1) * limit;

    const filter = {};

    if (queryParams.verified !== undefined && queryParams.verified !== 'ALL') {
      filter.verified = queryParams.verified === 'true';
    }

    if (queryParams.industry && queryParams.industry !== 'ALL') {
      filter.industry = queryParams.industry;
    }

    if (queryParams.search) {
      const searchRegex = new RegExp(queryParams.search.trim(), 'i');
      filter.$or = [{ name: searchRegex }, { industry: searchRegex }];
    }

    const [companies, total] = await Promise.all([
      Company.find(filter)
        .populate('ownerId', 'name email isVerified')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Company.countDocuments(filter),
    ]);

    // Attach internship counts using a single O(1) aggregation query (prevents N+1 database queries)
    const companyIds = companies.map((c) => c._id);
    const countsAgg = await Internship.aggregate([
      { $match: { companyId: { $in: companyIds } } },
      { $group: { _id: '$companyId', count: { $sum: 1 } } },
    ]);
    const countsMap = new Map(countsAgg.map((item) => [item._id.toString(), item.count]));

    const enhancedCompanies = companies.map((c) => ({
      ...c,
      internshipsCount: countsMap.get(c._id.toString()) || 0,
    }));

    return {
      data: enhancedCompanies,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * 5. Verify or Suspend Company.
   */
  static async verifyCompany(companyId, { verified }, adminUser, auditInfo = {}) {
    const company = await Company.findById(companyId);
    if (!company) {
      throw new ApiError(404, 'Company not found.');
    }

    company.verified = Boolean(verified);
    await company.save();

    const actionName = verified ? 'COMPANY_VERIFIED' : 'COMPANY_SUSPENDED';

    await AuditLog.create({
      userId: adminUser._id,
      action: actionName,
      resource: 'Company',
      resourceId: company._id,
      ipAddress: auditInfo.ipAddress || null,
      userAgent: auditInfo.userAgent || null,
      metadata: {
        companyName: company.name,
        verified: company.verified,
      },
    });

    return {
      success: true,
      message: `Company ${company.name} verification status updated to ${verified ? 'Verified' : 'Unverified'}.`,
      company,
    };
  }

  /**
   * 6. List all Internships with cross-company filters.
   */
  static async getInternships(queryParams = {}) {
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit, 10) || 15));
    const skip = (page - 1) * limit;

    const filter = {};

    if (queryParams.status && queryParams.status !== 'ALL') {
      filter.status = queryParams.status;
    }

    if (queryParams.type && queryParams.type !== 'ALL') {
      filter.type = queryParams.type;
    }

    if (queryParams.remote !== undefined && queryParams.remote !== 'ALL') {
      filter.remote = queryParams.remote === 'true';
    }

    if (queryParams.search) {
      const searchRegex = new RegExp(queryParams.search.trim(), 'i');
      filter.$or = [{ title: searchRegex }, { location: searchRegex }];
    }

    const [internships, total] = await Promise.all([
      Internship.find(filter)
        .populate('companyId', 'name logo verified website')
        .populate('postedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Internship.countDocuments(filter),
    ]);

    return {
      data: internships,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * 7. Moderate Internship Status (Publish, Draft, Close, Archive).
   */
  static async updateInternshipStatus(internshipId, { status }, adminUser, auditInfo = {}) {
    if (!Object.values(INTERNSHIP_STATUS).includes(status)) {
      throw new ApiError(400, 'Invalid internship status specified.');
    }

    const internship = await Internship.findById(internshipId);
    if (!internship) {
      throw new ApiError(404, 'Internship not found.');
    }

    const previousStatus = internship.status;
    internship.status = status;
    await internship.save();

    await AuditLog.create({
      userId: adminUser._id,
      action: 'INTERNSHIP_MODERATED',
      resource: 'Internship',
      resourceId: internship._id,
      ipAddress: auditInfo.ipAddress || null,
      userAgent: auditInfo.userAgent || null,
      metadata: {
        title: internship.title,
        previousStatus,
        newStatus: status,
      },
    });

    return {
      success: true,
      message: `Internship "${internship.title}" status updated to ${status}.`,
      internship,
    };
  }

  /**
   * 8. Delete or remove an internship.
   */
  static async deleteInternship(internshipId, adminUser, auditInfo = {}) {
    const internship = await Internship.findById(internshipId);
    if (!internship) {
      throw new ApiError(404, 'Internship not found.');
    }

    await Internship.findByIdAndDelete(internshipId);

    await AuditLog.create({
      userId: adminUser._id,
      action: 'INTERNSHIP_DELETED',
      resource: 'Internship',
      resourceId: internship._id,
      ipAddress: auditInfo.ipAddress || null,
      userAgent: auditInfo.userAgent || null,
      metadata: {
        title: internship.title,
        companyId: internship.companyId,
      },
    });

    return {
      success: true,
      message: `Internship "${internship.title}" deleted successfully.`,
    };
  }

  /**
   * 9. List Cross-Platform Applications.
   */
  static async getApplications(queryParams = {}) {
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit, 10) || 15));
    const skip = (page - 1) * limit;

    const filter = {};

    if (queryParams.status && queryParams.status !== 'ALL') {
      filter.status = queryParams.status;
    }

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate('studentId', 'name email avatar')
        .populate('internshipId', 'title slug location remote stipend type')
        .populate('companyId', 'name logo verified')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Application.countDocuments(filter),
    ]);

    return {
      data: applications,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * 10. List Audit Logs with User Population and Filters.
   */
  static async getAuditLogs(queryParams = {}) {
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const filter = {};

    if (queryParams.action && queryParams.action !== 'ALL') {
      filter.action = queryParams.action;
    }

    if (queryParams.resource && queryParams.resource !== 'ALL') {
      filter.resource = queryParams.resource;
    }

    if (queryParams.userId) {
      filter.userId = queryParams.userId;
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('userId', 'name email role avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    return {
      data: logs,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * 11. Broadcast System Notification to users.
   */
  static async broadcastNotification({ targetRole = 'ALL', title, message, link = '' }, adminUser, auditInfo = {}) {
    if (!title || !message) {
      throw new ApiError(400, 'Notification title and message are required.');
    }

    const userFilter = { isActive: true };
    if (targetRole !== 'ALL') {
      userFilter.role = targetRole;
    }

    const users = await User.find(userFilter).select('_id');

    if (users.length > 0) {
      const notifications = users.map((u) => ({
        userId: u._id,
        type: NOTIFICATION_TYPES.SYSTEM_ALERT,
        title: title.trim(),
        message: message.trim(),
        link: link.trim(),
        metadata: {
          broadcastBy: adminUser._id,
          targetRole,
        },
      }));

      // Perform bulk insert in batches of 500 to optimize throughput and memory
      const chunkSize = 500;
      for (let i = 0; i < notifications.length; i += chunkSize) {
        const chunk = notifications.slice(i, i + chunkSize);
        await Notification.insertMany(chunk, { ordered: false });
      }
    }

    await AuditLog.create({
      userId: adminUser._id,
      action: 'SYSTEM_BROADCAST_SENT',
      resource: 'Notification',
      ipAddress: auditInfo.ipAddress || null,
      userAgent: auditInfo.userAgent || null,
      metadata: {
        targetRole,
        recipientCount: users.length,
        title,
      },
    });

    return {
      success: true,
      message: `Broadcast delivered to ${users.length} user(s).`,
      recipientCount: users.length,
    };
  }
}

export default AdminService;
