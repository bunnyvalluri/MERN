import mongoose from 'mongoose';

export const APPLICATION_STATUS = {
  APPLIED: 'APPLIED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  SHORTLISTED: 'SHORTLISTED',
  INTERVIEW: 'INTERVIEW',
  SELECTED: 'SELECTED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN',
};

const timelineEntrySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, 'Timeline note cannot exceed 500 characters'],
    },
  },
  { _id: true }
);

const recruiterNoteSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Note content is required'],
      trim: true,
      maxlength: [2000, 'Note content cannot exceed 2000 characters'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const applicationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID reference is required'],
      index: true,
    },
    internshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship',
      required: [true, 'Internship ID reference is required'],
      index: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID reference is required'],
      index: true,
    },
    resume: {
      url: { type: String, required: [true, 'Resume file URL is required'] },
      publicId: { type: String, default: null },
      fileName: { type: String, default: 'resume.pdf' },
    },
    coverLetter: {
      type: String,
      trim: true,
      maxlength: [5000, 'Cover letter cannot exceed 5000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: Object.values(APPLICATION_STATUS),
        message: '{VALUE} is not a valid application status',
      },
      default: APPLICATION_STATUS.APPLIED,
      index: true,
    },
    timeline: {
      type: [timelineEntrySchema],
      default: () => [
        {
          status: APPLICATION_STATUS.APPLIED,
          changedAt: new Date(),
          note: 'Application submitted successfully',
        },
      ],
    },
    notes: {
      type: [recruiterNoteSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: 'applications',
  }
);

// CRITICAL UNIQUE COMPOUND INDEX: Prevents a student from applying multiple times to the same internship
applicationSchema.index(
  { internshipId: 1, studentId: 1 },
  { unique: true, name: 'unique_student_internship_application' }
);

// High-frequency recruiter & student dashboard query indexes
applicationSchema.index({ studentId: 1, status: 1, createdAt: -1 });
applicationSchema.index({ companyId: 1, status: 1, createdAt: -1 });
applicationSchema.index({ internshipId: 1, status: 1 });

export const Application = mongoose.model('Application', applicationSchema);
export default Application;
