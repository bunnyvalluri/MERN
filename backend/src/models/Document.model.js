import mongoose from 'mongoose';

export const DOCUMENT_TYPE = {
  RESUME: 'RESUME',
  AVATAR: 'AVATAR',
  COMPANY_LOGO: 'COMPANY_LOGO',
  CERTIFICATE: 'CERTIFICATE',
  COVER_LETTER: 'COVER_LETTER',
  TRANSCRIPT: 'TRANSCRIPT',
  OTHER: 'OTHER',
};

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    type: {
      type: String,
      enum: Object.values(DOCUMENT_TYPE),
      default: DOCUMENT_TYPE.RESUME,
      index: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    publicId: {
      type: String,
      required: [true, 'Storage public ID is required'],
    },
    fileName: {
      type: String,
      required: [true, 'Original file name is required'],
      trim: true,
    },
    fileSize: {
      type: Number,
      required: [true, 'File size in bytes is required'],
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isPrivate: {
      type: Boolean,
      default: true,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: 'documents',
  }
);

// Compound index for user documents listing
documentSchema.index({ userId: 1, type: 1, createdAt: -1 });
documentSchema.index({ userId: 1, isDefault: 1 });

export const Document = mongoose.model('Document', documentSchema);
export default Document;
