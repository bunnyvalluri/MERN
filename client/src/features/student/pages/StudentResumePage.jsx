import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchStudentProfile,
  uploadStudentResume,
  deleteStudentResume,
} from '../studentSlice.js';
import StudentNav from '../components/StudentNav.jsx';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Modal,
} from '../../../components/ui/index.js';
import { notify } from '../../../utils/toast.js';
import {
  FileText,
  UploadCloud,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';

export function StudentResumePage() {
  const dispatch = useDispatch();
  const { profile, saving } = useSelector((state) => state.student);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    dispatch(fetchStudentProfile());
  }, [dispatch]);

  const resume = profile?.resume;

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      notify.error('Please upload a PDF document (.pdf format only).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      notify.error('File size cannot exceed 10MB.');
      return;
    }

    processUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      notify.error('Please upload a PDF document (.pdf format only).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      notify.error('File size cannot exceed 10MB.');
      return;
    }

    processUpload(file);
  };

  const processUpload = async (file) => {
    setUploading(true);

    try {
      // In production with Cloudinary, file is uploaded to Cloudinary API and secure URL is returned.
      // Here we simulate the upload URL or FileReader conversion for seamless local/cloud operation.
      const simulatedUrl = `https://res.cloudinary.com/internhub/resumes/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

      const result = await dispatch(
        uploadStudentResume({
          url: simulatedUrl,
          fileName: file.name,
          publicId: `resume_${Date.now()}`,
        })
      );

      if (uploadStudentResume.fulfilled.match(result)) {
        notify.success('Resume uploaded successfully! Profile strength +10%.');
      } else {
        notify.error(result.payload || 'Failed to upload resume.');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    const result = await dispatch(deleteStudentResume());
    if (deleteStudentResume.fulfilled.match(result)) {
      notify.success('Resume deleted successfully.');
      setDeleteModalOpen(false);
    } else {
      notify.error(result.payload || 'Failed to delete resume.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <StudentNav />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Resume & Official Documents
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Upload your verified resume to enable 1-click internship applications.
          </p>
        </div>

        {/* Active Resume Card */}
        {resume?.url ? (
          <Card className="border-slate-800 bg-slate-900/90 shadow-card">
            <CardHeader className="pb-3 border-b border-slate-800 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <CardTitle className="text-sm font-bold text-white">Active Verified Resume</CardTitle>
              </div>
              <Badge variant="success" size="sm">
                Default Application Resume
              </Badge>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 font-bold text-sm">
                    PDF
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
                      {resume.fileName || 'Resume.pdf'}
                    </p>
                    <p className="text-xs text-slate-400">
                      Uploaded on {resume.uploadedAt ? new Date(resume.uploadedAt).toLocaleDateString() : 'recently'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={resume.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-lg bg-slate-800 text-xs font-semibold text-white hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <span>View Resume</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleteModalOpen(true)}
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Delete
                  </Button>
                </div>
              </div>

              {/* Replace Resume Action */}
              <div className="pt-2 border-t border-slate-800">
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Need to update your resume? Upload a replacement:
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    id="resume-replace-input"
                    accept=".pdf,application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label htmlFor="resume-replace-input">
                    <Button
                      variant="outline"
                      size="sm"
                      as="span"
                      isLoading={uploading}
                      leftIcon={<UploadCloud className="w-4 h-4" />}
                    >
                      Replace Resume PDF
                    </Button>
                  </label>
                  <span className="text-[11px] text-slate-500">Max size: 10MB (PDF only)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Upload Card (No resume yet) */
          <Card className="border-slate-800 bg-slate-900/90 shadow-card">
            <CardHeader className="pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-brand-400" />
                <CardTitle className="text-sm font-bold text-white">Upload Your Resume</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center space-y-4 transition-all ${
                  dragOver
                    ? 'border-brand-500 bg-brand-500/10'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto text-brand-400">
                  <FileText className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Drag and drop your PDF resume here
                  </h3>
                  <p className="text-xs text-slate-400">
                    Supports standard PDF format up to 10MB
                  </p>
                </div>

                <div>
                  <input
                    type="file"
                    id="resume-upload-input"
                    accept=".pdf,application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label htmlFor="resume-upload-input">
                    <Button
                      variant="primary"
                      size="md"
                      as="span"
                      isLoading={uploading}
                      loadingText="Uploading..."
                      leftIcon={<UploadCloud className="w-4 h-4" />}
                    >
                      Browse Files
                    </Button>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ATS Resume Guidance Card */}
        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader className="pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <CardTitle className="text-sm font-bold text-white">ATS Optimization Guidelines</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-3 text-xs text-slate-300">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p>
                <strong className="text-white">Use a clean, single-column format:</strong> Avoid complex tables, graphics, or multiple columns that confuse Applicant Tracking Systems.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p>
                <strong className="text-white">Include exact keyword matches:</strong> Mention frameworks and tools (e.g. React, Node.js, AWS) in your skills and project sections.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p>
                <strong className="text-white">Quantify your achievements:</strong> Use numbers where possible (e.g. &quot;Optimized page render times by 40%&quot;).
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Resume"
        description="Are you sure you want to remove your resume? Your profile completion score will decrease by 10%."
        size="sm"
      >
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" isLoading={saving} onClick={handleDelete}>
            Yes, Delete Resume
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default StudentResumePage;
