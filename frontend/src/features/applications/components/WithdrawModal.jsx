import React, { useState } from 'react';
import { Modal, Button, Textarea } from '../../../components/ui/index.js';
import { AlertTriangle } from 'lucide-react';

export function WithdrawModal({ isOpen, onClose, onConfirm, isSubmitting }) {
  const [note, setNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(note);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Withdraw Application"
      description="Are you sure you want to withdraw your application? This action cannot be undone."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Withdrawing will cancel your candidacy for this position. The hiring team will be notified of your decision.
          </span>
        </div>

        <Textarea
          label="Reason for Withdrawal (Optional)"
          placeholder="e.g. Accepted another offer, relocation, no longer available..."
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
            Keep Application
          </Button>
          <Button
            variant="danger"
            type="submit"
            isLoading={isSubmitting}
            loadingText="Withdrawing..."
          >
            Confirm Withdrawal
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default WithdrawModal;
