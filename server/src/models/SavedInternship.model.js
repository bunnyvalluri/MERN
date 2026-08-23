import mongoose from 'mongoose';

const savedInternshipSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
      index: true,
    },
    internshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship',
      required: [true, 'Internship reference is required'],
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'savedInternships',
  }
);

// Compound Unique Index: prevents duplicate saves of the same internship by a student
savedInternshipSchema.index(
  { studentId: 1, internshipId: 1 },
  { unique: true, name: 'unique_student_saved_internship' }
);

export const SavedInternship = mongoose.model('SavedInternship', savedInternshipSchema);
export default SavedInternship;
