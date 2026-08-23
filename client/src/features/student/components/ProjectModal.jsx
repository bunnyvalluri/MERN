import React, { useState, useEffect } from 'react';
import { Modal, Input, Textarea, Button } from '../../../components/ui/index.js';
import { notify } from '../../../utils/toast.js';

export function ProjectModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    githubUrl: '',
    technologiesStr: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        _id: initialData._id,
        title: initialData.title || '',
        description: initialData.description || '',
        link: initialData.link || '',
        githubUrl: initialData.githubUrl || '',
        technologiesStr: Array.isArray(initialData.technologies)
          ? initialData.technologies.join(', ')
          : '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        link: '',
        githubUrl: '',
        technologiesStr: '',
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      notify.error('Please enter project title and description.');
      return;
    }

    const technologies = formData.technologiesStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSave({
      _id: formData._id,
      title: formData.title.trim(),
      description: formData.description.trim(),
      link: formData.link.trim() || undefined,
      githubUrl: formData.githubUrl.trim() || undefined,
      technologies,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Project' : 'Add Project'}
      description="Highlight projects you have built to showcase your engineering abilities."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <Input
          label="Project Title"
          name="title"
          placeholder="e.g. Distributed Task Queue or AI Code Assistant"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <Textarea
          label="Project Description"
          name="description"
          placeholder="What problem does it solve? What architecture did you use?"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          required
        />

        <Input
          label="Technologies Used (comma separated)"
          name="technologiesStr"
          placeholder="e.g. React, Node.js, Redis, MongoDB, Docker"
          value={formData.technologiesStr}
          onChange={handleChange}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Live Demo Link (optional)"
            name="link"
            placeholder="https://myproject.dev"
            value={formData.link}
            onChange={handleChange}
          />

          <Input
            label="GitHub Repository (optional)"
            name="githubUrl"
            placeholder="https://github.com/user/project"
            value={formData.githubUrl}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-800">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save Project
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ProjectModal;
