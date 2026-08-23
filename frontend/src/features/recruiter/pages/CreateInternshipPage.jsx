import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { createInternship } from '../recruiterSlice.js';
import RecruiterNav from '../components/RecruiterNav.jsx';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Textarea,
  Select,
} from '../../../components/ui/index.js';
import { notify } from '../../../utils/toast.js';
import {
  Briefcase,
  DollarSign,
  Calendar,
  Users,
  MapPin,
  Laptop,
  CheckCircle2,
  ArrowLeft,
  Plus,
  X,
  Sparkles,
} from 'lucide-react';

const SUGGESTED_SKILLS = [
  'React',
  'JavaScript',
  'TypeScript',
  'Node.js',
  'Python',
  'Go',
  'Java',
  'SQL',
  'MongoDB',
  'PostgreSQL',
  'AWS',
  'Docker',
  'Tailwind CSS',
  'GraphQL',
  'Git',
];

export function CreateInternshipPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    category: 'Software Engineering',
    remote: 'REMOTE',
    type: 'FULL_TIME',
    duration: '3 Months',
    stipendAmount: 2000,
    isUnpaid: false,
    openings: 1,
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    city: 'San Francisco',
    country: 'United States',
    description: '',
    responsibilitiesText: 'Design, develop, and test scalable web applications.\nCollaborate with cross-functional engineering teams in agile sprints.\nParticipate in code reviews and write clean, maintainable code.',
    requirementsText: 'Pursuing a Bachelor\'s or Master\'s degree in Computer Science or related STEM field.\nStrong foundational understanding of data structures and algorithms.\nProficiency in modern JavaScript/TypeScript and web development.',
    skills: ['React', 'Node.js', 'TypeScript'],
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = (skillToAdd) => {
    const trimmed = (skillToAdd || skillInput).trim();
    if (!trimmed) return;
    if (!formData.skills.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleSubmit = async (targetStatus) => {
    if (!formData.title.trim()) {
      notify.error('Please enter an internship title.');
      return;
    }

    if (!formData.description.trim() || formData.description.length < 20) {
      notify.error('Please enter a description with at least 20 characters.');
      return;
    }

    if (formData.skills.length === 0) {
      notify.error('Please add at least one required skill tag.');
      return;
    }

    if (!formData.applicationDeadline) {
      notify.error('Please specify an application deadline.');
      return;
    }

    if (new Date(formData.applicationDeadline).getTime() <= Date.now()) {
      notify.error('Application deadline must be in the future.');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      category: formData.category,
      remote: formData.remote,
      type: formData.type,
      duration: formData.duration,
      stipend: {
        amount: formData.isUnpaid ? 0 : Number(formData.stipendAmount) || 0,
        currency: 'USD',
        period: 'MONTH',
        isUnpaid: formData.isUnpaid,
      },
      openings: Math.max(1, parseInt(formData.openings, 10) || 1),
      applicationDeadline: new Date(formData.applicationDeadline).toISOString(),
      location: {
        city: formData.city.trim(),
        country: formData.country.trim(),
      },
      description: formData.description.trim(),
      responsibilities: formData.responsibilitiesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      requirements: formData.requirementsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      skills: formData.skills,
      status: targetStatus,
    };

    setLoading(true);
    try {
      const result = await dispatch(createInternship(payload));
      if (createInternship.fulfilled.match(result)) {
        notify.success(
          targetStatus === 'PUBLISHED'
            ? 'Internship created and published successfully!'
            : 'Internship saved as draft.'
        );
        navigate('/recruiter/internships');
      } else {
        notify.error(result.payload || 'Failed to create internship.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-brand-500/20 selection:text-brand-700">
      <RecruiterNav />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Link
              to="/recruiter/internships"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to all postings
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Create Internship Posting
            </h1>
          </div>
        </div>

        {/* 1. Basic Opportunity Info */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-brand-600" />
              <CardTitle className="text-sm font-bold text-slate-900">Basic Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <Input
              label="Internship Title"
              placeholder="e.g. Frontend Engineering Intern, Summer 2026"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Role Category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                options={[
                  { value: 'Software Engineering', label: 'Software Engineering' },
                  { value: 'Product Management', label: 'Product Management' },
                  { value: 'Data Science & AI', label: 'Data Science & AI' },
                  { value: 'UI/UX Design', label: 'UI/UX Design' },
                  { value: 'DevOps & Cloud', label: 'DevOps & Cloud' },
                ]}
              />

              <Select
                label="Workplace Setting"
                value={formData.remote}
                onChange={(e) => handleInputChange('remote', e.target.value)}
                options={[
                  { value: 'REMOTE', label: 'Remote' },
                  { value: 'HYBRID', label: 'Hybrid' },
                  { value: 'ONSITE', label: 'On-site' },
                ]}
              />

              <Select
                label="Commitment"
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                options={[
                  { value: 'FULL_TIME', label: 'Full-Time Internship' },
                  { value: 'PART_TIME', label: 'Part-Time Internship' },
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* 2. Compensation & Timeline */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <CardTitle className="text-sm font-bold text-slate-900">Compensation & Timeline</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Input
                  label="Monthly Stipend ($)"
                  type="number"
                  placeholder="2000"
                  leftIcon={<DollarSign className="w-4 h-4 text-slate-400" />}
                  value={formData.stipendAmount}
                  onChange={(e) => handleInputChange('stipendAmount', e.target.value)}
                  disabled={formData.isUnpaid}
                />
                <label className="flex items-center gap-2 mt-2 cursor-pointer text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={formData.isUnpaid}
                    onChange={(e) => handleInputChange('isUnpaid', e.target.checked)}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span>This is an unpaid internship</span>
                </label>
              </div>

              <Input
                label="Duration"
                placeholder="e.g. 3 Months, 6 Months"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
              />

              <Input
                label="Openings Count"
                type="number"
                min={1}
                leftIcon={<Users className="w-4 h-4 text-slate-400" />}
                value={formData.openings}
                onChange={(e) => handleInputChange('openings', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              <Input
                label="Application Deadline"
                type="date"
                leftIcon={<Calendar className="w-4 h-4 text-slate-400" />}
                value={formData.applicationDeadline}
                onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
                required
              />

              <Input
                label="City / Region"
                leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />

              <Input
                label="Country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* 3. Description & Responsibilities */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Laptop className="w-4 h-4 text-brand-600" />
              <CardTitle className="text-sm font-bold text-slate-900">Job Description & Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <Textarea
              label="Role Overview & Mission"
              placeholder="Describe the mission of the team, the projects the intern will touch, and the learning environment..."
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
            />

            <Textarea
              label="Key Responsibilities (One item per line)"
              rows={4}
              value={formData.responsibilitiesText}
              onChange={(e) => handleInputChange('responsibilitiesText', e.target.value)}
            />

            <Textarea
              label="Requirements & Qualifications (One item per line)"
              rows={4}
              value={formData.requirementsText}
              onChange={(e) => handleInputChange('requirementsText', e.target.value)}
            />
          </CardContent>
        </Card>

        {/* 4. Required Skills Tags */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <CardTitle className="text-sm font-bold text-slate-900">Required Technical Skills</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Type a skill and press Enter or Add..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <Button variant="secondary" size="md" onClick={() => handleAddSkill()}>
                Add Skill
              </Button>
            </div>

            {/* Selected Skills */}
            <div className="flex flex-wrap gap-2 pt-2">
              {formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-red-600 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Suggested Skills */}
            <div className="space-y-1.5 pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-500 block">Suggested skills:</span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_SKILLS.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleAddSkill(skill)}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors"
                  >
                    + {skill}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Button
            variant="outline"
            size="md"
            isLoading={loading}
            onClick={() => handleSubmit('DRAFT')}
          >
            Save as Draft
          </Button>

          <Button
            variant="primary"
            size="md"
            isLoading={loading}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
            onClick={() => handleSubmit('PUBLISHED')}
          >
            Publish Opportunity
          </Button>
        </div>
      </main>
    </div>
  );
}

export default CreateInternshipPage;
