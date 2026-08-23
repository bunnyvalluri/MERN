import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCompanyProfile,
  updateCompanyProfile,
} from '../recruiterSlice.js';
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
  Badge,
} from '../../../components/ui/index.js';
import { notify } from '../../../utils/toast.js';
import {
  Building2,
  Globe,
  MapPin,
  Save,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export function CompanyProfilePage() {
  const dispatch = useDispatch();
  const { company } = useSelector((state) => state.recruiter);

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    industry: 'Software & Technology',
    website: '',
    companySize: '11-50',
    foundedYear: 2020,
    description: '',
    city: 'San Francisco',
    state: 'CA',
    country: 'United States',
    address: '',
  });

  useEffect(() => {
    dispatch(fetchCompanyProfile());
  }, [dispatch]);

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        logo: company.logo || '',
        industry: company.industry || 'Software & Technology',
        website: company.website || '',
        companySize: company.companySize || '11-50',
        foundedYear: company.foundedYear || 2020,
        description: company.description || '',
        city: company.location?.city || '',
        state: company.location?.state || '',
        country: company.location?.country || '',
        address: company.location?.address || '',
      });
    }
  }, [company]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      notify.error('Company name is required.');
      return;
    }

    if (!formData.description.trim() || formData.description.length < 10) {
      notify.error('Please enter a description with at least 10 characters.');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      logo: formData.logo.trim() || null,
      industry: formData.industry,
      website: formData.website.trim() || null,
      companySize: formData.companySize,
      foundedYear: Number(formData.foundedYear) || 2020,
      description: formData.description.trim(),
      location: {
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim(),
        address: formData.address.trim(),
      },
    };

    setSaving(true);
    try {
      const result = await dispatch(updateCompanyProfile(payload));
      if (updateCompanyProfile.fulfilled.match(result)) {
        notify.success('Company profile updated successfully!');
      } else {
        notify.error(result.payload || 'Failed to update company profile.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-brand-500/20 selection:text-brand-700">
      <RecruiterNav />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Company Hiring Profile
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Information displayed to students across your job postings and company page.
            </p>
          </div>

          {company?.verified && (
            <Badge variant="primary" size="sm">
              <ShieldCheck className="w-4 h-4 mr-1 text-brand-600" />
              Verified Employer
            </Badge>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Identity & Branding */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-600" />
                <CardTitle className="text-sm font-bold text-slate-900">Company Identity</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Company Name"
                  placeholder="e.g. Stripe, Acme Corp"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />

                <Input
                  label="Logo URL"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.logo}
                  onChange={(e) => handleInputChange('logo', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select
                  label="Industry"
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  options={[
                    { value: 'Software & Technology', label: 'Software & Technology' },
                    { value: 'Financial Services', label: 'Financial Services' },
                    { value: 'Healthcare & Biotech', label: 'Healthcare & Biotech' },
                    { value: 'E-commerce & Retail', label: 'E-commerce & Retail' },
                    { value: 'Artificial Intelligence', label: 'Artificial Intelligence' },
                    { value: 'Education & EdTech', label: 'Education & EdTech' },
                  ]}
                />

                <Select
                  label="Company Size"
                  value={formData.companySize}
                  onChange={(e) => handleInputChange('companySize', e.target.value)}
                  options={[
                    { value: '1-10', label: '1-10 Employees' },
                    { value: '11-50', label: '11-50 Employees' },
                    { value: '51-200', label: '51-200 Employees' },
                    { value: '201-500', label: '201-500 Employees' },
                    { value: '501-1000', label: '501-1000 Employees' },
                    { value: '1000+', label: '1000+ Employees' },
                  ]}
                />

                <Input
                  label="Founded Year"
                  type="number"
                  placeholder="2020"
                  value={formData.foundedYear}
                  onChange={(e) => handleInputChange('foundedYear', e.target.value)}
                />
              </div>

              <Input
                label="Company Website"
                placeholder="https://company.com"
                leftIcon={<Globe className="w-4 h-4 text-slate-400" />}
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
              />

              <Textarea
                label="About the Organization"
                placeholder="Tell students about your company culture, mission, and what makes working here great..."
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
              />
            </CardContent>
          </Card>

          {/* Location & Headquarters */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-600" />
                <CardTitle className="text-sm font-bold text-slate-900">Headquarters & Location</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="City"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
                <Input
                  label="State / Province"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                />
                <Input
                  label="Country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                />
              </div>

              <Input
                label="Street Address (Optional)"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={saving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Company Profile
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default CompanyProfilePage;
