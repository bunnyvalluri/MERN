import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      minlength: [2, 'Company name must be at least 2 characters long'],
      maxlength: [150, 'Company name cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    logo: {
      type: String,
      default: null,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Company description is required'],
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    website: {
      type: String,
      trim: true,
      match: [
        /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
        'Please provide a valid website URL',
      ],
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      trim: true,
      index: true,
    },
    location: {
      city: { type: String, trim: true, default: '' },
      state: { type: String, trim: true, default: '' },
      country: { type: String, trim: true, default: '' },
      address: { type: String, trim: true, default: '' },
    },
    companySize: {
      type: String,
      trim: true,
      default: '11-50',
    },
    foundedYear: {
      type: Number,
      min: [1800, 'Founded year must be 1800 or later'],
      max: [new Date().getFullYear(), 'Founded year cannot be in the future'],
    },
    verified: {
      type: Boolean,
      default: false,
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Company owner (User ID) is required'],
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'companies',
  }
);

// Compound index for industry and verification status
companySchema.index({ industry: 1, verified: 1 });

// Text index for search
companySchema.index({ name: 'text', description: 'text', industry: 'text' });

export const Company = mongoose.model('Company', companySchema);
export default Company;
