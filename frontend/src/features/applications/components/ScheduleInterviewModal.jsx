import React, { useState } from 'react';
import {
  Modal,
  Button,
  Input,
  Select,
  Textarea,
} from '../../../components/ui/index.js';
import { Calendar, Video, Clock } from 'lucide-react';

export function ScheduleInterviewModal({
  isOpen,
  onClose,
  onConfirm,
  candidateName = 'Candidate',
  internshipTitle = 'Internship',
  isSubmitting = false,
}) {
  const [formData, setFormData] = useState({
    scheduledAt: '',
    durationMinutes: 45,
    type: 'VIDEO',
    meetingLink: '',
    interviewerName: '',
    interviewerEmail: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  const interviewTypes = [
    { value: 'VIDEO', label: 'Video Call (Google Meet / Zoom)' },
    { value: 'PHONE', label: 'Phone Call' },
    { value: 'TECHNICAL_ASSESSMENT', label: 'Technical Coding Interview' },
    { value: 'IN_PERSON', label: 'In-Person Interview' },
  ];

  const durationOptions = [
    { value: '15', label: '15 Minutes (Quick Screen)' },
    { value: '30', label: '30 Minutes' },
    { value: '45', label: '45 Minutes' },
    { value: '60', label: '60 Minutes (1 Hour)' },
    { value: '90', label: '90 Minutes' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.scheduledAt) {
      newErrors.scheduledAt = 'Interview date & time is required';
    } else if (new Date(formData.scheduledAt).getTime() <= Date.now()) {
      newErrors.scheduledAt = 'Interview date must be in the future';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onConfirm({
      scheduledAt: new Date(formData.scheduledAt).toISOString(),
      durationMinutes: Number(formData.durationMinutes),
      type: formData.type,
      meetingLink: formData.meetingLink.trim(),
      interviewer: {
        name: formData.interviewerName.trim(),
        email: formData.interviewerEmail.trim(),
      },
      notes: formData.notes.trim(),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Schedule Interview: ${candidateName}`}
      description={`Inviting candidate to interview for ${internshipTitle}.`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Date & Time"
            type="datetime-local"
            required
            value={formData.scheduledAt}
            onChange={(e) =>
              setFormData({ ...formData, scheduledAt: e.target.value })
            }
            error={errors.scheduledAt}
            leftIcon={<Calendar className="w-4 h-4 text-slate-400" />}
          />

          <Select
            label="Duration"
            options={durationOptions}
            value={String(formData.durationMinutes)}
            onChange={(e) =>
              setFormData({
                ...formData,
                durationMinutes: Number(e.target.value),
              })
            }
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Interview Format"
            options={interviewTypes}
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value })
            }
          />

          <Input
            label="Meeting Link or Location"
            placeholder="https://meet.google.com/xyz-abcd-efg"
            value={formData.meetingLink}
            onChange={(e) =>
              setFormData({ ...formData, meetingLink: e.target.value })
            }
            leftIcon={<Video className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Lead Interviewer Name"
            placeholder="e.g. Jane Doe"
            value={formData.interviewerName}
            onChange={(e) =>
              setFormData({ ...formData, interviewerName: e.target.value })
            }
          />

          <Input
            label="Interviewer Email"
            type="email"
            placeholder="e.g. interviewer@company.com"
            value={formData.interviewerEmail}
            onChange={(e) =>
              setFormData({ ...formData, interviewerEmail: e.target.value })
            }
          />
        </div>

        <Textarea
          label="Preparation Notes for Candidate"
          placeholder="e.g. Please be prepared to discuss your React projects and experience with REST APIs..."
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            isLoading={isSubmitting}
            loadingText="Scheduling..."
            leftIcon={<Calendar className="w-4 h-4" />}
          >
            Confirm & Send Invitation
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ScheduleInterviewModal;
