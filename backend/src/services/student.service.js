import mongoose from 'mongoose';
import { StudentProfile } from '../models/StudentProfile.model.js';
import { User, USER_ROLES } from '../models/User.model.js';
import { ApiError } from '../utils/ApiError.js';


export const calculateProfileCompletion = (profile, _user = null) => {
  let score = 0;
  const nextSteps = [];

  const breakdown = {
    basicInfo: { label: 'Basic Information', weight: 20, earned: 0, completed: false, missing: [] },
    education: { label: 'Education History', weight: 20, earned: 0, completed: false, missing: [] },
    skills: { label: 'Technical Skills', weight: 20, earned: 0, completed: false, missing: [] },
    experience: { label: 'Work Experience', weight: 15, earned: 0, completed: false, missing: [] },
    projects: { label: 'Projects & Portfolio', weight: 15, earned: 0, completed: false, missing: [] },
    resume: { label: 'Verified Resume', weight: 10, earned: 0, completed: false, missing: [] },
  };

  // 1. Basic Information (20%)
  const hasHeadline = Boolean(profile?.headline && profile.headline.trim().length > 3);
  const hasBio = Boolean(profile?.bio && profile.bio.trim().length > 10);
  const hasPhone = Boolean(profile?.phone && profile.phone.trim().length > 5);
  const hasLocation = Boolean(profile?.location?.city && profile?.location?.country);

  if (!hasHeadline) breakdown.basicInfo.missing.push('Add a professional headline');
  if (!hasBio) breakdown.basicInfo.missing.push('Write a short bio about yourself');
  if (!hasPhone) breakdown.basicInfo.missing.push('Add your contact phone number');
  if (!hasLocation) breakdown.basicInfo.missing.push('Set your location (city and country)');

  const basicFilledCount = [hasHeadline, hasBio, hasPhone, hasLocation].filter(Boolean).length;
  const basicScore = Math.round((basicFilledCount / 4) * 20);
  breakdown.basicInfo.earned = basicScore;
  if (basicFilledCount === 4) {
    breakdown.basicInfo.completed = true;
  }
  score += basicScore;

  // 2. Education (20%)
  if (Array.isArray(profile?.education) && profile.education.length > 0) {
    breakdown.education.completed = true;
    breakdown.education.earned = 20;
    score += 20;
  } else {
    breakdown.education.missing.push('Add at least one college or university degree');
  }

  // 3. Skills (20%) - Target 3+ skills
  const skillsCount = Array.isArray(profile?.skills) ? profile.skills.length : 0;
  if (skillsCount >= 3) {
    breakdown.skills.completed = true;
    breakdown.skills.earned = 20;
    score += 20;
  } else if (skillsCount > 0) {
    const earned = Math.round((skillsCount / 3) * 20);
    breakdown.skills.earned = earned;
    score += earned;
    breakdown.skills.missing.push(`Add ${3 - skillsCount} more skills to reach recommended target`);
  } else {
    breakdown.skills.missing.push('Add at least 3 verified technical skills');
  }

  // 4. Experience (15%)
  if (Array.isArray(profile?.experience) && profile.experience.length > 0) {
    breakdown.experience.completed = true;
    breakdown.experience.earned = 15;
    score += 15;
  } else {
    breakdown.experience.missing.push('Add past internship, work, or leadership experience');
  }

  // 5. Projects (15%)
  if (Array.isArray(profile?.projects) && profile.projects.length > 0) {
    breakdown.projects.completed = true;
    breakdown.projects.earned = 15;
    score += 15;
  } else {
    breakdown.projects.missing.push('Add a technical project with repository or live link');
  }

  // 6. Resume (10%)
  if (profile?.resume?.url) {
    breakdown.resume.completed = true;
    breakdown.resume.earned = 10;
    score += 10;
  } else {
    breakdown.resume.missing.push('Upload your current PDF resume');
  }

  Object.values(breakdown).forEach((section) => {
    if (section.missing.length > 0) {
      nextSteps.push(...section.missing);
    }
  });

  const percentage = Math.min(100, Math.max(0, score));

  return {
    percentage,
    breakdown,
    nextSteps: nextSteps.slice(0, 3),
  };
};

export class StudentService {
  /**
   * Retrieves current student's full profile and completion metric.
   */
  static async getOwnProfile(userId) {
    if (mongoose.connection.readyState !== 1) {
      throw new ApiError(503, 'Database connection unavailable. Please try again shortly.');
    }

    let profile = await StudentProfile.findOne({ userId });
    if (!profile) {
      profile = await StudentProfile.create({
        userId,
        headline: '',
        bio: '',
        skills: [],
      });
    }

    const user = await User.findById(userId).select(
      '_id name email avatar role isVerified isActive'
    );

    const completion = calculateProfileCompletion(profile, user);
    return { user, profile, completion };
  }

  /**
   * Updates student profile fields.
   */
  static async updateOwnProfile(userId, updateData) {
    if (mongoose.connection.readyState !== 1) {
      throw new ApiError(503, 'Database connection unavailable. Please try again shortly.');
    }

    let profile = await StudentProfile.findOne({ userId });
    if (!profile) {
      profile = new StudentProfile({ userId, ...updateData });
    } else {
      Object.assign(profile, updateData);
    }
    await profile.save();

    const user = await User.findById(userId).select(
      '_id name email avatar role isVerified isActive'
    );
    const completion = calculateProfileCompletion(profile, user);
    return { user, profile, completion };
  }

  /**
   * Uploads or replaces student resume.
   */
  static async updateResume(userId, { url, fileName, publicId }) {
    if (mongoose.connection.readyState !== 1) {
      throw new ApiError(503, 'Database connection unavailable. Please try again shortly.');
    }

    let profile = await StudentProfile.findOne({ userId });
    if (!profile) profile = new StudentProfile({ userId });

    profile.resume = {
      url,
      fileName,
      publicId: publicId || null,
      uploadedAt: new Date(),
    };
    await profile.save();

    const completion = calculateProfileCompletion(profile);
    return { resume: profile.resume, completion };
  }

  /**
   * Deletes student resume.
   */
  static async deleteResume(userId) {
    if (mongoose.connection.readyState !== 1) {
      throw new ApiError(503, 'Database connection unavailable. Please try again shortly.');
    }

    const profile = await StudentProfile.findOne({ userId });
    if (!profile) throw new ApiError(404, 'Student profile not found.');

    profile.resume = { url: null, fileName: null, publicId: null, uploadedAt: null };
    await profile.save();

    const completion = calculateProfileCompletion(profile);
    return { completion };
  }

  /**
   * Retrieves public view of a student profile.
   */
  static async getPublicProfile(studentUserId) {
    if (mongoose.connection.readyState !== 1) {
      throw new ApiError(503, 'Database connection unavailable. Please try again shortly.');
    }

    const user = await User.findById(studentUserId).select(
      '_id name email avatar role isVerified isActive'
    );
    if (!user || user.role !== USER_ROLES.STUDENT) {
      throw new ApiError(404, 'Student profile not found.');
    }
    const profile = await StudentProfile.findOne({ userId: studentUserId });
    if (!profile) {
      throw new ApiError(404, 'Student profile details not available.');
    }
    return { user, profile };
  }
}

export default StudentService;
