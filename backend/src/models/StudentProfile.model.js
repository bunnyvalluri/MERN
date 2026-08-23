import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema(
  {
    institution: {
      type: String,
      required: [true, 'Institution name is required'],
      trim: true,
      maxlength: [150, 'Institution name cannot exceed 150 characters'],
    },
    degree: {
      type: String,
      required: [true, 'Degree is required'],
      trim: true,
      maxlength: [100, 'Degree cannot exceed 100 characters'],
    },
    fieldOfStudy: {
      type: String,
      trim: true,
      maxlength: [100, 'Field of study cannot exceed 100 characters'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
    },
    current: {
      type: Boolean,
      default: false,
    },
    gpa: {
      type: String,
      trim: true,
      maxlength: [10, 'GPA cannot exceed 10 characters'],
    },
  },
  { _id: true }
);

const experienceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company cannot exceed 100 characters'],
    },
    location: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
    },
    current: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Experience description cannot exceed 2000 characters'],
    },
  },
  { _id: true }
);

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [100, 'Project title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
      maxlength: [2000, 'Project description cannot exceed 2000 characters'],
    },
    link: {
      type: String,
      trim: true,
    },
    githubUrl: {
      type: String,
      trim: true,
    },
    technologies: {
      type: [String],
      default: [],
    },
  },
  { _id: true }
);

const certificationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Certification name is required'],
      trim: true,
      maxlength: [150, 'Certification name cannot exceed 150 characters'],
    },
    issuer: {
      type: String,
      required: [true, 'Issuer name is required'],
      trim: true,
      maxlength: [100, 'Issuer cannot exceed 100 characters'],
    },
    issueDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
    },
    credentialId: {
      type: String,
      trim: true,
    },
    credentialUrl: {
      type: String,
      trim: true,
    },
  },
  { _id: true }
);

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID reference is required'],
      unique: true,
      index: true,
    },
    headline: {
      type: String,
      trim: true,
      maxlength: [200, 'Headline cannot exceed 200 characters'],
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [3000, 'Bio cannot exceed 3000 characters'],
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [25, 'Phone cannot exceed 25 characters'],
      default: '',
    },
    location: {
      city: { type: String, trim: true, default: '' },
      state: { type: String, trim: true, default: '' },
      country: { type: String, trim: true, default: '' },
    },
    education: {
      type: [educationSchema],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
      index: true, // Multikey index for skills query
    },
    experience: {
      type: [experienceSchema],
      default: [],
    },
    projects: {
      type: [projectSchema],
      default: [],
    },
    certifications: {
      type: [certificationSchema],
      default: [],
    },
    resume: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
      fileName: { type: String, default: null },
      uploadedAt: { type: Date, default: null },
    },
    portfolio: {
      type: String,
      trim: true,
      default: '',
    },
    github: {
      type: String,
      trim: true,
      default: '',
    },
    linkedin: {
      type: String,
      trim: true,
      default: '',
    },
    preferences: {
      desiredRoles: { type: [String], default: [] },
      targetLocations: { type: [String], default: [] },
      remotePreference: {
        type: String,
        enum: ['REMOTE', 'HYBRID', 'ONSITE', 'FLEXIBLE'],
        default: 'FLEXIBLE',
      },
      expectedStipend: {
        amount: { type: Number, default: 0 },
        currency: { type: String, default: 'USD' },
        period: { type: String, enum: ['HOUR', 'MONTH', 'TOTAL'], default: 'MONTH' },
      },
    },
  },
  {
    timestamps: true,
    collection: 'studentProfiles',
  }
);

// Text index for candidate search by headline, bio, skills
studentProfileSchema.index(
  { headline: 'text', bio: 'text', skills: 'text' },
  { weights: { skills: 10, headline: 5, bio: 1 } }
);

export const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);
export default StudentProfile;
