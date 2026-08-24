import mongoose from 'mongoose';

export const SOURCE_TYPE = {
  INTERNAL: 'INTERNAL',
  API: 'API',
  ATS: 'ATS',
  FEED: 'FEED',
  EMPLOYER: 'EMPLOYER',
};

export const FRESHNESS_STATE = {
  LIVE: 'LIVE',
  RECENT: 'RECENT',
  STALE: 'STALE',
  EXPIRED: 'EXPIRED',
  REMOVED: 'REMOVED',
};

export const INTERNSHIP_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  CLOSED: 'CLOSED',
  ARCHIVED: 'ARCHIVED',
  EXPIRED: 'EXPIRED',
  REMOVED: 'REMOVED',
};

export const WORKPLACE_TYPE = {
  REMOTE: 'REMOTE',
  HYBRID: 'HYBRID',
  ONSITE: 'ONSITE',
  FLEXIBLE: 'FLEXIBLE',
};

export const EMPLOYMENT_TYPE = {
  INTERNSHIP: 'INTERNSHIP',
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  CONTRACT: 'CONTRACT',
};

export const OPPORTUNITY_TYPE = {
  INTERNSHIP: 'INTERNSHIP',
  JOB: 'JOB',
  FELLOWSHIP: 'FELLOWSHIP',
};

export const APPLICATION_METHOD = {
  INTERNAL: 'INTERNAL',
  EXTERNAL: 'EXTERNAL',
};

const sourceReferenceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    externalId: { type: String, required: true },
    url: { type: String, default: '' },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const internshipSchema = new mongoose.Schema(
  {
    externalId: {
      type: String,
      trim: true,
      index: true,
      default: null,
    },
    source: {
      type: String,
      trim: true,
      default: 'InternHub',
      index: true,
    },
    sourceType: {
      type: String,
      enum: Object.values(SOURCE_TYPE),
      default: SOURCE_TYPE.INTERNAL,
      index: true,
    },
    sourceUrl: {
      type: String,
      trim: true,
      default: '',
    },
    canonicalUrl: {
      type: String,
      trim: true,
      default: '',
    },
    fingerprint: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      index: true,
    },
    sources: {
      type: [sourceReferenceSchema],
      default: [],
    },
    title: {
      type: String,
      required: [true, 'Internship title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [300, 'Title cannot exceed 300 characters'],
      index: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
      index: true,
    },
    companyName: {
      type: String,
      trim: true,
      default: 'Partner Employer',
      index: true,
    },
    companyLogo: {
      type: String,
      trim: true,
      default: null,
    },
    companyWebsite: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [25000, 'Description cannot exceed 25000 characters'],
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [1000, 'Short description cannot exceed 1000 characters'],
      default: '',
    },
    employmentType: {
      type: String,
      enum: Object.values(EMPLOYMENT_TYPE),
      default: EMPLOYMENT_TYPE.INTERNSHIP,
      index: true,
    },
    opportunityType: {
      type: String,
      enum: Object.values(OPPORTUNITY_TYPE),
      default: OPPORTUNITY_TYPE.INTERNSHIP,
      index: true,
    },
    workMode: {
      type: String,
      enum: Object.values(WORKPLACE_TYPE),
      default: WORKPLACE_TYPE.REMOTE,
      index: true,
    },
    // Compatibility mirror for remote string / workplace enum
    remote: {
      type: String,
      enum: Object.values(WORKPLACE_TYPE),
      default: WORKPLACE_TYPE.REMOTE,
      index: true,
    },
    type: {
      type: String,
      default: 'FULL_TIME',
      index: true,
    },
    isRemote: { type: Boolean, default: false },
    isHybrid: { type: Boolean, default: false },
    isOnsite: { type: Boolean, default: false },
    locations: {
      type: [String],
      default: [],
      index: true,
    },
    location: {
      city: { type: String, trim: true, default: '' },
      state: { type: String, trim: true, default: '' },
      country: { type: String, trim: true, default: 'India' },
      address: { type: String, trim: true, default: '' },
    },
    city: { type: String, trim: true, default: '', index: true },
    state: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, default: 'India', index: true },
    stipend: {
      amount: { type: Number, default: null, min: 0 },
      currency: { type: String, default: 'INR', uppercase: true },
      period: { type: String, enum: ['HOUR', 'MONTH', 'TOTAL', 'YEAR'], default: 'MONTH' },
      isUnpaid: { type: Boolean, default: false },
      minAmount: { type: Number, default: null },
      maxAmount: { type: Number, default: null },
    },
    salary: {
      min: { type: Number, default: null },
      max: { type: Number, default: null },
      currency: { type: String, default: 'INR' },
      period: { type: String, default: 'MONTH' },
    },
    salaryMin: { type: Number, default: null, index: true },
    salaryMax: { type: Number, default: null, index: true },
    currency: { type: String, default: 'INR', uppercase: true },
    skills: {
      type: [String],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'At least one skill is required',
      },
      index: true,
    },
    technologies: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      trim: true,
      default: 'Software Development',
      index: true,
    },
    subCategory: {
      type: String,
      trim: true,
      default: '',
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    requirements: {
      type: [String],
      default: [],
    },
    eligibility: {
      type: String,
      trim: true,
      default: '',
    },
    education: {
      type: [String],
      default: [],
    },
    experienceMin: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    experienceMax: {
      type: Number,
      default: 2,
      min: 0,
    },
    graduationYears: {
      type: [Number],
      default: [],
    },
    branches: {
      type: [String],
      default: [],
    },
    duration: {
      type: String,
      trim: true,
      default: '3 Months',
    },
    startDate: {
      type: Date,
      default: null,
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
    postedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastVerifiedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    freshnessState: {
      type: String,
      enum: Object.values(FRESHNESS_STATE),
      default: FRESHNESS_STATE.LIVE,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(INTERNSHIP_STATUS),
      default: INTERNSHIP_STATUS.PUBLISHED,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: true,
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: ['VERIFIED', 'UNVERIFIED', 'PENDING'],
      default: 'VERIFIED',
      index: true,
    },
    applicationUrl: {
      type: String,
      trim: true,
      default: '',
    },
    applicationMethod: {
      type: String,
      enum: Object.values(APPLICATION_METHOD),
      default: APPLICATION_METHOD.INTERNAL,
      index: true,
    },
    applicationCount: {
      type: Number,
      default: null, // Authentic count or null if external/unknown
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    // Mirror properties for backwards compatibility
    applicationsCount: {
      type: Number,
      default: 0,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    searchText: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    collection: 'internships',
  }
);

// Pre-save hook: Synchronize search text and boolean workplace flags
internshipSchema.pre('save', function (next) {
  if (this.workMode) {
    this.remote = this.workMode;
    this.isRemote = this.workMode === WORKPLACE_TYPE.REMOTE;
    this.isHybrid = this.workMode === WORKPLACE_TYPE.HYBRID;
    this.isOnsite = this.workMode === WORKPLACE_TYPE.ONSITE;
  }
  if (!this.companyName && this.companyId?.name) {
    this.companyName = this.companyId.name;
  }
  const skillsStr = Array.isArray(this.skills) ? this.skills.join(' ') : '';
  const locStr = [this.location?.city, this.location?.state, this.location?.country].filter(Boolean).join(' ');
  this.searchText = `${this.title} ${this.companyName} ${skillsStr} ${locStr} ${this.category || ''}`.toLowerCase();
  next();
});

// High-frequency compound indexes
internshipSchema.index({ isActive: 1, status: 1, applicationDeadline: 1 });
internshipSchema.index({ isActive: 1, status: 1, postedAt: -1 });
internshipSchema.index({ isActive: 1, status: 1, workMode: 1, postedAt: -1 });
internshipSchema.index({ isActive: 1, status: 1, category: 1, postedAt: -1 });
internshipSchema.index({ isActive: 1, status: 1, 'location.city': 1 });
internshipSchema.index({ 'stipend.amount': 1, isActive: 1 });
internshipSchema.index({ 'sources.name': 1, 'sources.externalId': 1 });
internshipSchema.index({ source: 1, externalId: 1 });

// Full-text search index with weighted relevance
internshipSchema.index(
  {
    title: 'text',
    companyName: 'text',
    skills: 'text',
    description: 'text',
    category: 'text',
    'location.city': 'text',
  },
  {
    weights: {
      title: 10,
      companyName: 8,
      skills: 6,
      category: 4,
      'location.city': 3,
      description: 1,
    },
    name: 'internship_full_text_search',
  }
);

export const Internship = mongoose.model('Internship', internshipSchema);
export default Internship;
