import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from '../../../components/ui/index.js';
import { notify } from '../../../utils/toast.js';

export function CertificationModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    name: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    credentialUrl: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        _id: initialData._id,
        name: initialData.name || '',
        issuer: initialData.issuer || '',
        issueDate: initialData.issueDate ? initialData.issueDate.split('T')[0] : '',
        expiryDate: initialData.expiryDate ? initialData.expiryDate.split('T')[0] : '',
        credentialId: initialData.credentialId || '',
        credentialUrl: initialData.credentialUrl || '',
      });
    } else {
      setFormData({
        name: '',
        issuer: '',
        issueDate: '',
        expiryDate: '',
        credentialId: '',
        credentialUrl: '',
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.issuer.trim()) {
      notify.error('Please enter certification name and issuer.');
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Certification' : 'Add Certification'}
      description="Add verified professional certificates, licenses, or awards."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <Input
          label="Certification Name"
          name="name"
          placeholder="e.g. AWS Certified Developer - Associate"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <Input
          label="Issuing Organization"
          name="issuer"
          placeholder="e.g. Amazon Web Services (AWS) or Coursera"
          value={formData.issuer}
          onChange={handleChange}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Issue Date"
            type="date"
            name="issueDate"
            value={formData.issueDate}
            onChange={handleChange}
          />

          <Input
            label="Expiration Date (optional)"
            type="date"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Credential ID"
            name="credentialId"
            placeholder="e.g. AWS-DEV-987654"
            value={formData.credentialId}
            onChange={handleChange}
          />

          <Input
            label="Credential URL"
            name="credentialUrl"
            placeholder="https://credly.com/your-badge"
            value={formData.credentialUrl}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save Certification
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CertificationModal;
