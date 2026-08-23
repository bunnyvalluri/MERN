import mongoose from 'mongoose';

export const INTERVIEW_STATUS = {
  SCHEDULED: 'SCHEDULED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  RESCHEDULED: 'RESCHEDULED',
};

export const INTERVIEW_TYPE = {
  VIDEO: 'VIDEO',
  PHONE: 'PHONE',
  IN_PERSON: 'IN_PERSON',
  TECHNICAL_ASSESSMENT: 'TECHNICAL_ASSESSMENT',
};

const interviewSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: [true, 'Application reference is required'],
      index: true,
    },
    internshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship',
      required: [true, 'Internship reference is required'],
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
      index: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required'],
      index: true,
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Interview scheduled date and time is required'],
      index: true,
    },
    durationMinutes: {
      type: Number,
      default: 45,
      min: [15, 'Interview must be at least 15 minutes'],
      max: [240, 'Interview cannot exceed 240 minutes'],
    },
    type: {
      type: String,
      enum: Object.values(INTERVIEW_TYPE),
      default: INTERVIEW_TYPE.VIDEO,
    },
    meetingLink: {
      type: String,
      trim: true,
      default: '',
    },
    interviewer: {
      name: { type: String, trim: true, default: '' },
      email: { type: String, trim: true, lowercase: true, default: '' },
    },
    status: {
      type: String,
      enum: Object.values(INTERVIEW_STATUS),
      default: INTERVIEW_STATUS.SCHEDULED,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
      default: '',
    },
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      notes: { type: String, trim: true, maxlength: [3000] },
      submittedAt: { type: Date },
    },
  },
  {
    timestamps: true,
    collection: 'interviews',
  }
);

// High-frequency query indexes for calendar schedules
interviewSchema.index({ studentId: 1, scheduledAt: 1, status: 1 });
interviewSchema.index({ companyId: 1, scheduledAt: 1, status: 1 });

export const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;
