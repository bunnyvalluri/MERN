import 'dotenv/config';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Resolve environment variables from backend or root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../backend/.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { connectDB, closeDB } from '../../backend/src/config/db.js';

import {
  User,
  StudentProfile,
  Company,
  Internship,
  Application,
  Interview,
  Notification,
  AuditLog,
  SavedInternship,
  Document,
  APPLICATION_STATUS,
  INTERVIEW_STATUS,
} from '../../backend/src/models/index.js';

import { mockUsers, mockCompanies, mockInternships } from './data/mockData.js';

console.log('=============================================================================');
console.log('                 🌱 INTERNHUB ENTERPRISE DATABASE SEEDER                     ');
console.log('=============================================================================\n');

async function seedDatabase() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('❌ FATAL: Database seeding is strictly prohibited in PRODUCTION environment.');
  }

  const startTime = Date.now();

  try {
    console.log('📡 Connecting to MongoDB Atlas...');
    await connectDB();
    console.log('  ✅ Connected successfully to MongoDB.\n');

    console.log('🧹 Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      StudentProfile.deleteMany({}),
      Company.deleteMany({}),
      Internship.deleteMany({}),
      Application.deleteMany({}),
      Interview.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
      SavedInternship.deleteMany({}),
      Document.deleteMany({}),
    ]);
    console.log('  ✅ All collections cleared.\n');

    // ─── 1. Seed Admin User ───────────────────────────────────────────────────
    console.log('👤 Seeding System Administrator...');
    const salt = await bcrypt.genSalt(12);
    const adminPasswordHash = await bcrypt.hash(mockUsers.admin.password, salt);

    const adminUser = await User.create({
      name: mockUsers.admin.name,
      email: mockUsers.admin.email,
      passwordHash: adminPasswordHash,
      role: mockUsers.admin.role,
      isVerified: mockUsers.admin.isVerified,
      avatar: mockUsers.admin.avatar,
    });
    console.log(`  ✅ Admin created: ${adminUser.email}`);

    // ─── 2. Seed Companies & Recruiters ───────────────────────────────────────
    console.log('\n🏢 Seeding Companies & Verified Recruiters...');
    const companyMap = new Map();
    const recruiterMap = new Map();

    for (const recData of mockUsers.recruiters) {
      const recPasswordHash = await bcrypt.hash(recData.password, salt);
      const recruiterUser = await User.create({
        name: recData.name,
        email: recData.email,
        passwordHash: recPasswordHash,
        role: recData.role,
        isVerified: recData.isVerified,
        avatar: recData.avatar,
      });

      const compData = mockCompanies.find((c) => c.slug === recData.companySlug);
      if (compData) {
        const company = await Company.create({
          ...compData,
          ownerId: recruiterUser._id,
        });
        companyMap.set(compData.slug, company);
        recruiterMap.set(compData.slug, recruiterUser);
        console.log(`  ✅ Company [${company.name}] seeded with Recruiter [${recruiterUser.email}]`);
      }
    }

    // ─── 3. Seed Students & Profiles ──────────────────────────────────────────
    console.log('\n🎓 Seeding Student Candidates & Profiles...');
    const createdStudents = [];

    for (const stuData of mockUsers.students) {
      const stuPasswordHash = await bcrypt.hash(stuData.password, salt);
      const studentUser = await User.create({
        name: stuData.name,
        email: stuData.email,
        passwordHash: stuPasswordHash,
        role: stuData.role,
        isVerified: stuData.isVerified,
        avatar: stuData.avatar,
      });

      await StudentProfile.create({
        userId: studentUser._id,
        ...stuData.profile,
        resume: {
          url: 'https://internhub-resumes.s3.amazonaws.com/samples/sample-resume.pdf',
          fileName: `${stuData.name.toLowerCase().replace(/\s+/g, '_')}_resume.pdf`,
          uploadedAt: new Date(),
        },
      });

      createdStudents.push(studentUser);
      console.log(`  ✅ Student [${studentUser.name}] (${studentUser.email}) profile created`);
    }

    // ─── 4. Seed Internships ──────────────────────────────────────────────────
    console.log('\n💼 Seeding Realistic Internship Postings...');
    const createdInternships = [];

    for (const internData of mockInternships) {
      const company = companyMap.get(internData.companySlug);
      const recruiter = recruiterMap.get(internData.companySlug);

      if (!company || !recruiter) continue;

      const { companySlug, ...postingFields } = internData;
      const internship = await Internship.create({
        ...postingFields,
        companyId: company._id,
        createdBy: recruiter._id,
        viewsCount: Math.floor(Math.random() * 450) + 50,
      });

      createdInternships.push(internship);
      console.log(`  ✅ Internship [${internship.title}] at ${company.name}`);
    }

    // ─── 5. Seed Applications & Timelines ─────────────────────────────────────
    console.log('\n📝 Seeding Sample Applications & History...');
    const createdApplications = [];

    const appStatuses = [
      APPLICATION_STATUS.APPLIED,
      APPLICATION_STATUS.UNDER_REVIEW,
      APPLICATION_STATUS.SHORTLISTED,
      APPLICATION_STATUS.INTERVIEW,
      APPLICATION_STATUS.SELECTED,
    ];

    for (let i = 0; i < createdStudents.length; i++) {
      const student = createdStudents[i];
      // Each student applies to 2 distinct internships
      const targetInternships = [
        createdInternships[i % createdInternships.length],
        createdInternships[(i + 2) % createdInternships.length],
      ];

      for (let j = 0; j < targetInternships.length; j++) {
        const internship = targetInternships[j];
        const status = appStatuses[(i + j) % appStatuses.length];

        const app = await Application.create({
          studentId: student._id,
          internshipId: internship._id,
          companyId: internship.companyId,
          resume: {
            url: 'https://internhub-resumes.s3.amazonaws.com/samples/sample-resume.pdf',
            fileName: 'resume.pdf',
          },
          coverLetter: `Hello hiring team at InternHub partner company, I am writing to express my strong enthusiasm for the ${internship.title} role. My technical background aligns directly with your requirements.`,
          status,
          timeline: [
            {
              status: APPLICATION_STATUS.APPLIED,
              changedAt: new Date(Date.now() - 7 * 86400000),
              note: 'Initial application submitted via InternHub portal',
            },
            ...(status !== APPLICATION_STATUS.APPLIED
              ? [
                  {
                    status,
                    changedAt: new Date(Date.now() - 2 * 86400000),
                    note: `Status updated to ${status} by recruiter`,
                  },
                ]
              : []),
          ],
        });

        // Increment application count on internship
        await Internship.findByIdAndUpdate(internship._id, {
          $inc: { applicationsCount: 1 },
        });

        createdApplications.push(app);
        console.log(`  ✅ Application: [${student.name}] -> [${internship.title}] (${status})`);
      }
    }

    // ─── 6. Seed Interviews ───────────────────────────────────────────────────
    console.log('\n📅 Seeding Scheduled Interviews...');
    const interviewApps = createdApplications.filter(
      (a) => a.status === APPLICATION_STATUS.INTERVIEW || a.status === APPLICATION_STATUS.SHORTLISTED
    );

    for (const app of interviewApps) {
      const interview = await Interview.create({
        applicationId: app._id,
        internshipId: app.internshipId,
        studentId: app.studentId,
        companyId: app.companyId,
        scheduledAt: new Date(Date.now() + 3 * 86400000),
        durationMinutes: 45,
        type: 'VIDEO',
        meetingLink: 'https://meet.google.com/abc-internhub-xyz',
        interviewer: {
          name: 'Senior Hiring Lead',
          email: 'lead@company.com',
        },
        status: INTERVIEW_STATUS.SCHEDULED,
        notes: 'Technical discussion on architecture, systems design, and problem solving.',
      });
      console.log(`  ✅ Interview booked for App ID ${app._id}`);
    }

    // ─── 7. Seed Notifications ────────────────────────────────────────────────
    console.log('\n🔔 Seeding Initial User Notifications...');
    for (const student of createdStudents) {
      await Notification.create({
        userId: student._id,
        type: 'REGISTRATION_WELCOME',
        title: 'Welcome to InternHub! 🚀',
        message: 'Your student account is active. Complete your profile to get discovered by top tech recruiters.',
        link: '/student/profile',
        read: false,
      });

      await Notification.create({
        userId: student._id,
        type: 'APPLICATION_SUBMITTED',
        title: 'Application Received',
        message: 'Your internship application was submitted successfully and is now pending review.',
        link: '/student/dashboard',
        read: true,
      });
    }
    console.log('  ✅ Notifications seeded for all candidates.');

    // ─── Summary Dashboard ────────────────────────────────────────────────────
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n=============================================================================');
    console.log('                      ✨ DATABASE SEEDING COMPLETED                          ');
    console.log('=============================================================================');
    console.log(`⏱️  Duration: ${duration} seconds`);
    console.log(`👤 Users:           ${await User.countDocuments()}`);
    console.log(`🏢 Companies:       ${await Company.countDocuments()}`);
    console.log(`🎓 StudentProfiles: ${await StudentProfile.countDocuments()}`);
    console.log(`💼 Internships:     ${await Internship.countDocuments()}`);
    console.log(`📝 Applications:    ${await Application.countDocuments()}`);
    console.log(`📅 Interviews:      ${await Interview.countDocuments()}`);
    console.log(`🔔 Notifications:   ${await Notification.countDocuments()}`);
    console.log('=============================================================================');
    console.log('\n🔑 Demo Credentials:');
    console.log('  • Admin:     admin@internhub.dev / AdminPassword123!');
    console.log('  • Recruiter: sarah.jenkins@stripe.com / RecruiterPassword123!');
    console.log('  • Student:   jordan.lee@stanford.edu / StudentPassword123!');
    console.log('=============================================================================\n');
    await closeDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder Error:', error);
    process.exit(1);
  }
}

seedDatabase();
