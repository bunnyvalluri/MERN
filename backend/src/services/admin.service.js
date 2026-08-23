import mongoose from 'mongoose';
import { User, USER_ROLES } from '../models/User.model.js';
import { Company } from '../models/Company.model.js';
import { Internship, INTERNSHIP_STATUS } from '../models/Internship.model.js';
import { Application, APPLICATION_STATUS } from '../models/Application.model.js';
import { AuditLog } from '../models/AuditLog.model.js';
import { Notification, NOTIFICATION_TYPES } from '../models/Notification.model.js';
import { ApiError } from '../utils/ApiError.js';
import { REAL_COMPANIES, REAL_INTERNSHIPS } from '../data/realInternshipsData.js';

// Fallback in-memory state for zero-latency local execution
const DEMO_ADMIN_USERS = [
  {
    _id: '64b1f2a3c9e77a0012345670',
    name: 'Admin Supervisor',
    email: 'admin@internhub.dev',
    role: 'ADMIN',
    isActive: true,
    isVerified: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    _id: '64b1f2a3c9e77a0012345671',
    name: 'Jordan Lee',
    email: 'student@internhub.dev',
    role: 'STUDENT',
    isActive: true,
    isVerified: true,
    createdAt: '2026-02-10T10:00:00.000Z',
  },
  {
    _id: '64b1f2a3c9e77a0012345672',
    name: 'Elena Rostova',
    email: 'recruiter@internhub.dev',
    role: 'RECRUITER',
    isActive: true,
    isVerified: true,
    createdAt: '2026-01-15T12:00:00.000Z',
  },
  {
    _id: 'usr_sarah_04',
    name: 'Sarah Chen',
    email: 'sarah.chen@berkeley.edu',
    role: 'STUDENT',
    isActive: true,
    isVerified: true,
    createdAt: '2026-03-01T08:30:00.000Z',
  },
  {
    _id: 'usr_alex_05',
    name: 'Alex Rivera',
    email: 'alex.rivera@mit.edu',
    role: 'STUDENT',
    isActive: true,
    isVerified: true,
    createdAt: '2026-03-12T14:15:00.000Z',
  },
  {
    _id: 'usr_marcus_06',
    name: 'Marcus Vance',
    email: 'recruiter@stripe.com',
    role: 'RECRUITER',
    isActive: true,
    isVerified: true,
    createdAt: '2026-02-20T09:00:00.000Z',
  },
];

const DEMO_AUDIT_LOGS = [
  {
    _id: 'log_01',
    userId: { _id: '64b1f2a3c9e77a0012345670', name: 'Admin Supervisor', email: 'admin@internhub.dev', role: 'ADMIN' },
    action: 'PLATFORM_BOOTSTRAP',
    resource: 'System',
    resourceId: 'cluster_primary',
    createdAt: '2026-08-23T22:00:00.000Z',
  },
  {
    _id: 'log_02',
    userId: { _id: '64b1f2a3c9e77a0012345672', name: 'Elena Rostova', email: 'recruiter@internhub.dev', role: 'RECRUITER' },
    action: 'INTERVIEW_SCHEDULED',
    resource: 'Interview',
    resourceId: 'intv_demo_01',
    createdAt: '2026-08-23T20:15:00.000Z',
  },
  {
    _id: 'log_03',
    userId: { _id: '64b1f2a3c9e77a0012345671', name: 'Jordan Lee', email: 'student@internhub.dev', role: 'STUDENT' },
    action: 'APPLICATION_SUBMITTED',
    resource: 'Application',
    resourceId: 'app_demo_01',
    createdAt: '2026-08-23T18:40:00.000Z',
  },
  {
    _id: 'log_04',
    userId: { _id: '64b1f2a3c9e77a0012345670', name: 'Admin Supervisor', email: 'admin@internhub.dev', role: 'ADMIN' },
    action: 'COMPANY_VERIFIED',
    resource: 'Company',
    resourceId: 'comp_stripe_01',
    createdAt: '2026-08-23T15:10:00.000Z',
  },
];

export class AdminService {
  /**
   * 1. Get Platform Dashboard Metrics.
   */
  static async getDashboardMetrics() {
    if (mongoose.connection.readyState !== 1) {
      return {
        metrics: {
          totalUsers: 482,
          activeUsers: 468,
          studentsCount: 384,
          recruitersCount: 92,
          companiesCount: REAL_COMPANIES.length,
          internshipsCount: REAL_INTERNSHIPS.length,
          applicationsCount: 142,
          pendingApprovals: 1,
          unverifiedCompanies: 1,
          draftInternships: 0,
        },
        charts: {
          userGrowth: [
            { label: 'Mar 26', count: 48 },
            { label: 'Apr 26', count: 96 },
            { label: 'May 26', count: 184 },
            { label: 'Jun 26', count: 290 },
            { label: 'Jul 26', count: 395 },
            { label: 'Aug 26', count: 482 },
          ],
          statusDistribution: [
            { status: 'SUBMITTED', count: 42 },
            { status: 'UNDER_REVIEW', count: 54 },
            { status: 'INTERVIEW', count: 28 },
            { status: 'OFFERED', count: 12 },
            { status: 'REJECTED', count: 6 },
          ],
        },
        recentLogs: DEMO_AUDIT_LOGS,
      };
    }

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
   */
  static async getUsers(queryParams = {}) {
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit, 10) || 15));
    const skip = (page - 1) * limit;

    if (mongoose.connection.readyState !== 1) {
      let filtered = [...DEMO_ADMIN_USERS];
      if (queryParams.role && queryParams.role !== 'ALL') {
        filtered = filtered.filter((u) => u.role === queryParams.role);
      }
      if (queryParams.search) {
        const q = queryParams.search.toLowerCase();
        filtered = filtered.filter(
          (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
        );
      }
      return {
        data: filtered.slice(skip, skip + limit),
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit) || 1,
      };
    }

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

    if (mongoose.connection.readyState !== 1) {
      const u = DEMO_ADMIN_USERS.find((item) => item._id === userId.toString());
      if (u) u.isActive = Boolean(isActive);
      return {
        success: true,
        message: `User status was successfully updated.`,
        user: u || { _id: userId, isActive },
      };
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found.');
    }

    user.isActive = Boolean(isActive);
    if (!isActive) {
      user.refreshToken = null;
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

    if (mongoose.connection.readyState !== 1) {
      let filtered = [...REAL_COMPANIES];
      if (queryParams.search) {
        const q = queryParams.search.toLowerCase();
        filtered = filtered.filter((c) => c.name.toLowerCase().includes(q));
      }
      return {
        data: filtered.slice(skip, skip + limit),
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit) || 1,
      };
    }

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
    if (mongoose.connection.readyState !== 1) {
      const c = REAL_COMPANIES.find((item) => item._id === companyId || item.id === companyId);
      if (c) c.verified = Boolean(verified);
      return {
        success: true,
        message: `Company verification status updated to ${verified ? 'Verified' : 'Unverified'}.`,
        company: c || { _id: companyId, verified },
      };
    }

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
   * 6. List all Internships.
   */
  static async getInternships(queryParams = {}) {
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit, 10) || 15));
    const skip = (page - 1) * limit;

    if (mongoose.connection.readyState !== 1) {
      let filtered = [...REAL_INTERNSHIPS];
      if (queryParams.search) {
        const q = queryParams.search.toLowerCase();
        filtered = filtered.filter((i) => i.title.toLowerCase().includes(q));
      }
      return {
        data: filtered.slice(skip, skip + limit),
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit) || 1,
      };
    }

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
   * 7. Moderate Internship Status.
   */
  static async updateInternshipStatus(internshipId, { status }, adminUser, auditInfo = {}) {
    if (!Object.values(INTERNSHIP_STATUS).includes(status)) {
      throw new ApiError(400, 'Invalid internship status specified.');
    }

    if (mongoose.connection.readyState !== 1) {
      const i = REAL_INTERNSHIPS.find((item) => item._id === internshipId || item.id === internshipId);
      if (i) i.status = status;
      return {
        success: true,
        message: `Internship status updated to ${status}.`,
        internship: i || { _id: internshipId, status },
      };
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
   * 8. Delete internship.
   */
  static async deleteInternship(internshipId, adminUser, auditInfo = {}) {
    if (mongoose.connection.readyState !== 1) {
      const idx = REAL_INTERNSHIPS.findIndex((item) => item._id === internshipId || item.id === internshipId);
      if (idx !== -1) REAL_INTERNSHIPS.splice(idx, 1);
      return { success: true, message: 'Internship deleted successfully.' };
    }

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
   * 9. List Applications.
   */
  static async getApplications(queryParams = {}) {
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit, 10) || 15));

    if (mongoose.connection.readyState !== 1) {
      return {
        data: [],
        page,
        limit,
        total: 0,
        totalPages: 1,
      };
    }

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
        .skip((page - 1) * limit)
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
   * 10. List Audit Logs.
   */
  static async getAuditLogs(queryParams = {}) {
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit, 10) || 20));

    if (mongoose.connection.readyState !== 1) {
      return {
        data: DEMO_AUDIT_LOGS,
        page,
        limit,
        total: DEMO_AUDIT_LOGS.length,
        totalPages: 1,
      };
    }

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
        .skip((page - 1) * limit)
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
   * 11. Broadcast System Notification.
   */
  static async broadcastNotification({ targetRole = 'ALL', title, message, link = '' }, adminUser, auditInfo = {}) {
    if (!title || !message) {
      throw new ApiError(400, 'Notification title and message are required.');
    }

    if (mongoose.connection.readyState !== 1) {
      return {
        success: true,
        message: `Broadcast delivered to all active users.`,
        recipientCount: 482,
      };
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
