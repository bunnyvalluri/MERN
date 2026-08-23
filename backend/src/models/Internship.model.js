import mongoose from 'mongoose';

export const INTERNSHIP_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  CLOSED: 'CLOSED',
  ARCHIVED: 'ARCHIVED',
};

export const WORKPLACE_TYPE = {
  REMOTE: 'REMOTE',
  HYBRID: 'HYBRID',
  ONSITE: 'ONSITE',
};

export const EMPLOYMENT_TYPE = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
};

const internshipSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Internship title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
      maxlength: [10000, 'Description cannot exceed 10000 characters'],
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    requirements: {
      type: [String],
      default: [],
    },
    skills: {
      type: [String],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'At least one skill tag is required',
      },
      index: true, // Multikey index
    },
    location: {
      city: { type: String, trim: true, default: '' },
      state: { type: String, trim: true, default: '' },
      country: { type: String, trim: true, default: '' },
    },
    remote: {
      type: String,
      enum: Object.values(WORKPLACE_TYPE),
      default: WORKPLACE_TYPE.REMOTE,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(EMPLOYMENT_TYPE),
      default: EMPLOYMENT_TYPE.FULL_TIME,
    },
    duration: {
      type: String,
      trim: true,
      default: '3 Months',
    },
    stipend: {
      amount: { type: Number, default: 0, min: 0 },
      currency: { type: String, default: 'USD', uppercase: true },
      period: { type: String, enum: ['HOUR', 'MONTH', 'TOTAL'], default: 'MONTH' },
      isUnpaid: { type: Boolean, default: false },
    },
    openings: {
      type: Number,
      default: 1,
      min: [1, 'Must have at least 1 opening'],
    },
    applicationDeadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(INTERNSHIP_STATUS),
      default: INTERNSHIP_STATUS.DRAFT,
      index: true,
    },
    category: {
      type: String,
      trim: true,
      index: true,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    applicationsCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by (User ID) is required'],
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'internships',
  }
);

// High-frequency compound query indexes
internshipSchema.index({ companyId: 1, status: 1 });
internshipSchema.index({ status: 1, applicationDeadline: 1 });
internshipSchema.index({ status: 1, remote: 1, createdAt: -1 });
internshipSchema.index({ skills: 1, status: 1 });

// Full-text search index with relevance weighting
internshipSchema.index(
  { title: 'text', description: 'text', skills: 'text' },
  { weights: { title: 10, skills: 6, description: 1 }, name: 'internship_text_index' }
);

export const Internship = mongoose.model('Internship', internshipSchema);
export default Internship;
