import React, { useState } from 'react';
import { AlertTriangle, XCircle } from 'lucide-react';
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalContent,
  ModalFooter,
  Button,
  Textarea,
} from '../../../components/ui/index.js';

export function CancelInterviewModal({
  isOpen,
  onClose,
  interview,
  onConfirm,
  loading = false,
}) {
  const [reason, setReason] = useState('');

  if (!interview) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      id: interview._id,
      reason: reason.trim() || 'Cancelled by recruiter',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalHeader onClose={onClose}>
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="w-5 h-5" />
          <ModalTitle className="text-white font-bold">Cancel Interview</ModalTitle>
        </div>
      </ModalHeader>

      <form onSubmit={handleSubmit}>
        <ModalContent className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Are you sure you want to cancel the interview with{' '}
            <strong className="text-white">
              {interview.studentId?.name || 'this candidate'}
            </strong>{' '}
            for <strong className="text-white">{interview.internshipId?.title}</strong>?
          </p>

          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-[11px] text-red-300">
            This will update the interview status to <strong className="font-mono">CANCELLED</strong> and notify the candidate automatically.
          </div>

          <Textarea
            label="Cancellation Reason (Sent to candidate)"
            placeholder="e.g., Position has been filled, scheduling conflict..."
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </ModalContent>

        <ModalFooter className="border-t border-slate-800 flex justify-end gap-2">
          <Button variant="ghost" type="button" onClick={onClose} disabled={loading}>
            Keep Interview
          </Button>
          <Button
            variant="danger"
            type="submit"
            isLoading={loading}
            loadingText="Cancelling..."
          >
            Confirm Cancellation
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

export default CancelInterviewModal;
