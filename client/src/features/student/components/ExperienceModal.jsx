import React, { useState, useEffect } from 'react';
import { Modal, Input, Textarea, Button, Checkbox } from '../../../components/ui/index.js';
import { notify } from '../../../utils/toast.js';

export function ExperienceModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        _id: initialData._id,
        title: initialData.title || '',
        company: initialData.company || '',
        location: initialData.location || '',
        startDate: initialData.startDate ? initialData.startDate.split('T')[0] : '',
        endDate: initialData.endDate ? initialData.endDate.split('T')[0] : '',
        current: Boolean(initialData.current),
        description: initialData.description || '',
      });
    } else {
      setFormData({
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.company.trim() || !formData.startDate) {
      notify.error('Please fill in role title, company name, and start date.');
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Experience' : 'Add Experience'}
      description="Add an internship, part-time job, or leadership experience."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Role / Title"
            name="title"
            placeholder="e.g. Software Engineering Intern"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <Input
            label="Company / Organization"
            name="company"
            placeholder="e.g. Stripe or Google"
            value={formData.company}
            onChange={handleChange}
            required
          />
        </div>

        <Input
          label="Location"
          name="location"
          placeholder="e.g. San Francisco, CA or Remote"
          value={formData.location}
          onChange={handleChange}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Start Date"
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
          />

          {!formData.current && (
            <Input
              label="End Date"
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
            />
          )}
        </div>

        <Checkbox
          label="I currently work here"
          name="current"
          checked={formData.current}
          onChange={handleChange}
        />

        <Textarea
          label="Key Responsibilities & Achievements"
          name="description"
          placeholder="Describe your impact, tools used, and key accomplishments..."
          rows={3}
          value={formData.description}
          onChange={handleChange}
        />

        <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-800">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save Experience
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ExperienceModal;
