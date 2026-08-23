import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Checkbox } from '../../../components/ui/index.js';
import { notify } from '../../../utils/toast.js';

export function EducationModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    current: false,
    gpa: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        _id: initialData._id,
        institution: initialData.institution || '',
        degree: initialData.degree || '',
        fieldOfStudy: initialData.fieldOfStudy || '',
        startDate: initialData.startDate ? initialData.startDate.split('T')[0] : '',
        endDate: initialData.endDate ? initialData.endDate.split('T')[0] : '',
        current: Boolean(initialData.current),
        gpa: initialData.gpa || '',
      });
    } else {
      setFormData({
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        current: false,
        gpa: '',
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
    if (!formData.institution.trim() || !formData.degree.trim() || !formData.startDate) {
      notify.error('Please enter institution, degree, and start date.');
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Education' : 'Add Education'}
      description="Add your degree, university or college details."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <Input
          label="College / University Name"
          name="institution"
          placeholder="e.g. Stanford University or IIT Madras"
          value={formData.institution}
          onChange={handleChange}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Degree"
            name="degree"
            placeholder="e.g. Bachelor of Science"
            value={formData.degree}
            onChange={handleChange}
            required
          />

          <Input
            label="Field of Study / Major"
            name="fieldOfStudy"
            placeholder="e.g. Computer Science"
            value={formData.fieldOfStudy}
            onChange={handleChange}
          />
        </div>

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
              label="End Date (or Expected)"
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
            />
          )}
        </div>

        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2.5 pt-1">
          <Checkbox
            label="I am currently studying here"
            name="current"
            checked={formData.current}
            onChange={handleChange}
          />

          <div className="w-full xs:w-32">
            <Input
              placeholder="GPA: 3.8/4.0"
              name="gpa"
              value={formData.gpa}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-800">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save Education
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default EducationModal;
