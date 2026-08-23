import React, { useState } from 'react';
import { Calendar, Clock, Video, FileText, AlertCircle } from 'lucide-react';
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalContent,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
} from '../../../components/ui/index.js';

export function RescheduleInterviewModal({
  isOpen,
  onClose,
  interview,
  onConfirm,
  loading = false,
}) {
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('45');
  const [meetingUrl, setMeetingUrl] = useState(interview?.meetingLink || interview?.meetingUrl || '');
  const [reason, setReason] = useState('Schedule update');
  const [notes, setNotes] = useState(interview?.notes || '');
  const [error, setError] = useState('');

  if (!interview) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!scheduledAt) {
      setError('Please select a new interview date and time.');
      return;
    }

    const selectedDate = new Date(scheduledAt);
    if (selectedDate.getTime() <= Date.now()) {
      setError('The rescheduled date and time must be in the future.');
      return;
    }

    onConfirm({
      id: interview._id,
      data: {
        scheduledAt: selectedDate.toISOString(),
        durationMinutes: parseInt(durationMinutes, 10) || 45,
        meetingUrl: meetingUrl.trim(),
        reason: reason.trim(),
        notes: notes.trim(),
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader onClose={onClose}>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-600" />
          <ModalTitle className="text-slate-900 font-bold">Reschedule Interview</ModalTitle>
        </div>
      </ModalHeader>

      <form onSubmit={handleSubmit}>
        <ModalContent className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <p className="text-xs text-slate-500">Candidate / Role:</p>
            <p className="text-sm font-bold text-slate-900">
              {interview.studentId?.name || 'Candidate'} •{' '}
              <span className="text-brand-600 font-normal">
                {interview.internshipId?.title || 'Internship'}
              </span>
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              Current Date: {new Date(interview.scheduledAt).toLocaleString()}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="datetime-local"
              label="New Date & Time"
              required
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="font-mono text-xs"
            />
            <Select
              label="Duration"
              options={[
                { value: '30', label: '30 minutes' },
                { value: '45', label: '45 minutes' },
                { value: '60', label: '60 minutes (1 hour)' },
                { value: '90', label: '90 minutes (1.5 hours)' },
              ]}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
            />
          </div>

          <Input
            label="Meeting URL (Google Meet / Zoom)"
            placeholder="https://meet.google.com/xxx-xxxx-xxx"
            value={meetingUrl}
            onChange={(e) => setMeetingUrl(e.target.value)}
            leftIcon={<Video className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="Reason for Rescheduling"
            placeholder="e.g., Interviewer availability conflict"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          <Textarea
            label="Candidate Preparation Notes (Optional)"
            placeholder="Add updated instructions or technical topic overview..."
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </ModalContent>

        <ModalFooter className="border-t border-slate-100 flex justify-end gap-2">
          <Button variant="ghost" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="warning"
            type="submit"
            isLoading={loading}
            loadingText="Rescheduling..."
          >
            Confirm Reschedule
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

export default RescheduleInterviewModal;
