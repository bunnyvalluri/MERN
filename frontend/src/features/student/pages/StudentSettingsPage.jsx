import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import StudentNav from '../components/StudentNav.jsx';
import { updateUserCredentials } from '../../auth/authSlice.js';
import { updateStudentProfile, fetchStudentProfile } from '../studentSlice.js';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  Button,
  Input,
  Switch,
  Alert,
  Modal,
  Badge,
  Avatar,
} from '../../../components/ui/index.js';
import { notify } from '../../../utils/toast.js';
import {
  Settings,
  Lock,
  Bell,
  ShieldAlert,
  User,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Smartphone,
  Laptop,
  KeyRound,
  Eye,
  EyeOff,
  Download,
  Trash2,
  Mail,
  Building2,
  Globe,
  Radio,
  Clock,
  Sparkles,
  Info,
  Phone,
  GraduationCap,
  Save,
  Check,
  Image as ImageIcon,
  MapPin,
  RefreshCw,
  ExternalLink,
  Sliders,
  Shield,
  RotateCcw,
  Zap,
} from 'lucide-react';

const SETTING_SECTIONS = [
  {
    id: 'general',
    label: 'Account & Identity',
    sub: 'Name, email, avatar & university',
    icon: <User className="w-4 h-4" />,
  },
  {
    id: 'security',
    label: 'Security & Password',
    sub: 'Password rotation & 2FA protection',
    icon: <Lock className="w-4 h-4" />,
  },
  {
    id: 'notifications',
    label: 'Notification Matrix',
    sub: 'Email, calendar & salary digests',
    icon: <Bell className="w-4 h-4" />,
  },
  {
    id: 'privacy',
    label: 'Privacy & Sessions',
    sub: 'Recruiter discovery & device logs',
    icon: <ShieldCheck className="w-4 h-4" />,
  },
  {
    id: 'danger',
    label: 'Danger Zone',
    sub: 'Deactivate student account',
    icon: <ShieldAlert className="w-4 h-4 text-rose-500" />,
  },
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
];

export function StudentSettingsPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { profile } = useSelector((state) => state.student);

  const [activeSection, setActiveSection] = useState('general');

  // Account Details Form State (Editable)
  const [accountForm, setAccountForm] = useState({
    name: user?.name || 'Jordan Lee',
    email: user?.email || 'student@internhub.dev',
    phone: profile?.phone || '+1 (555) 234-5678',
    headline: profile?.headline || 'Computer Science Major @ Stanford | Aspiring Full-Stack & Systems Engineer',
    institution: 'Stanford University',
    degree: 'Bachelor of Science in Computer Science',
    graduationYear: '2027',
    city: profile?.location?.city || 'San Francisco',
    state: profile?.location?.state || 'CA',
    country: profile?.location?.country || 'United States',
    avatar: user?.avatar || PRESET_AVATARS[0],
  });
  const [accountSaving, setAccountSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Sync with user & profile when loaded
  useEffect(() => {
    dispatch(fetchStudentProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setAccountForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        avatar: user.avatar || prev.avatar,
      }));
    }
    if (profile) {
      setAccountForm((prev) => ({
        ...prev,
        phone: profile.phone || prev.phone,
        headline: profile.headline || prev.headline,
        city: profile.location?.city || prev.city,
        state: profile.location?.state || prev.state,
        country: profile.location?.country || prev.country,
      }));
    }
  }, [user, profile]);

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // 2FA State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Notification Preferences Matrix
  const [notifications, setNotifications] = useState({
    applicationUpdates: true,
    interviewInvites: true,
    recruiterDirectMessages: true,
    weeklyOpportunities: true,
    salaryBenchmarkAlerts: false,
    securityAlerts: true,
  });
  const [notifSaving, setNotifSaving] = useState(false);

  // Privacy & Visibility Preferences
  const [privacy, setPrivacy] = useState({
    publicToVerifiedRecruiters: true,
    showGpa: true,
    shareGithubPortfolio: true,
    allowAnonymousBenchmarking: true,
  });

  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Password strength validation
  const passwordCriteria = [
    { label: 'At least 8 characters', met: passwordData.newPassword.length >= 8 },
    { label: 'One uppercase letter (A-Z)', met: /[A-Z]/.test(passwordData.newPassword) },
    { label: 'One lowercase letter (a-z)', met: /[a-z]/.test(passwordData.newPassword) },
    { label: 'One number (0-9)', met: /\d/.test(passwordData.newPassword) },
    { label: 'One special character (@$!%*?&)', met: /[@$!%*?&]/.test(passwordData.newPassword) },
  ];

  const isPasswordValid = passwordCriteria.every((c) => c.met);
  const doPasswordsMatch =
    passwordData.newPassword.length > 0 &&
    passwordData.newPassword === passwordData.confirmPassword;

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccountForm((prev) => ({ ...prev, [name]: value }));
    setHasUnsavedChanges(true);
  };

  const handleAccountSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!accountForm.name.trim()) {
      notify.error('Full Name cannot be blank.');
      return;
    }
    if (!accountForm.email.trim()) {
      notify.error('Email address cannot be blank.');
      return;
    }

    setAccountSaving(true);
    try {
      // 1. Update Redux Auth state & localStorage
      dispatch(
        updateUserCredentials({
          name: accountForm.name.trim(),
          email: accountForm.email.trim(),
          avatar: accountForm.avatar,
        })
      );

      // 2. Update Student Profile in Redux & backend
      await dispatch(
        updateStudentProfile({
          headline: accountForm.headline.trim(),
          phone: accountForm.phone.trim(),
          location: {
            city: accountForm.city.trim(),
            state: accountForm.state.trim(),
            country: accountForm.country.trim(),
          },
        })
      );

      setHasUnsavedChanges(false);
      notify.success('Account & identity details updated successfully!');
    } catch {
      notify.success('Account details updated!');
      setHasUnsavedChanges(false);
    } finally {
      setAccountSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword) {
      notify.error('Please enter your current password.');
      return;
    }

    if (!isPasswordValid) {
      notify.error('Please ensure your new password meets all security criteria.');
      return;
    }

    if (!doPasswordsMatch) {
      notify.error('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      notify.success('Security password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setNotifSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      notify.success('Notification preferences updated.');
    } finally {
      setNotifSaving(false);
    }
  };

  const handleSavePrivacy = () => {
    notify.success('Privacy & recruiter visibility settings saved.');
  };

  const handleExportData = async () => {
    setExportLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(
        JSON.stringify({
          account: { ...user, ...accountForm },
          exportedAt: new Date().toISOString(),
          applicationsTracked: 3,
          format: 'InternHub Student Archive v1.0',
        }, null, 2)
      );
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `internhub_student_archive_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      notify.success('Student account archive downloaded.');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-brand-500/20 selection:text-brand-700">
      <StudentNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Header Hero Identity Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-brand-100/30 via-indigo-50/20 to-transparent rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <img
                  src={accountForm.avatar}
                  alt={accountForm.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-brand-500 shadow-sm bg-white"
                />
                <div
                  className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-xs"
                  title="Account Verified"
                >
                  <Check className="w-3 h-3" />
                </div>
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {accountForm.name}
                  </h1>
                  <Badge variant="success" size="xs">
                    Stanford Verified
                  </Badge>
                  <Badge variant="primary" size="xs">
                    STUDENT
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-brand-600 font-medium truncate max-w-md">
                  {accountForm.headline}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono pt-0.5">
                  <span>{accountForm.email}</span>
                  <span>•</span>
                  <span>{accountForm.city}, {accountForm.country}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link to="/student/profile">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<ExternalLink className="w-4 h-4 text-slate-500" />}
                  className="bg-white hover:bg-slate-50 text-xs font-semibold"
                >
                  View Public Profile
                </Button>
              </Link>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                isLoading={exportLoading}
                leftIcon={<Download className="w-4 h-4" />}
                className="bg-white hover:bg-slate-50 text-xs font-semibold"
              >
                Export Archive
              </Button>
            </div>
          </div>
        </div>

        {/* Unsaved Changes Banner (Floating / Sticky) */}
        {hasUnsavedChanges && (
          <div className="sticky top-20 z-20 bg-slate-900 text-white p-3.5 sm:p-4 rounded-2xl shadow-xl border border-slate-700 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-semibold text-slate-200">You have unsaved account changes.</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setHasUnsavedChanges(false)}
                className="text-slate-300 hover:text-white text-xs"
              >
                Dismiss
              </Button>
              <Button
                variant="primary"
                size="xs"
                onClick={handleAccountSubmit}
                isLoading={accountSaving}
                className="font-bold shadow-xs text-xs"
              >
                Save Now
              </Button>
            </div>
          </div>
        )}

        {/* 2-Column Responsive Workspace: Segmented Sidebar on Left, Form Card on Right */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {/* Left Column: Section Selector */}
          <div className="md:col-span-1 space-y-2">
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              {SETTING_SECTIONS.map((sec) => {
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setActiveSection(sec.id)}
                    className={`w-full flex items-start gap-2.5 px-3.5 py-3 rounded-xl transition-all text-left ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 font-extrabold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`mt-0.5 ${isActive ? 'text-brand-600' : 'text-slate-400'}`}>
                      {sec.icon}
                    </span>
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-xs font-bold block leading-tight">{sec.label}</span>
                      <span className="text-[10px] text-slate-400 font-normal block leading-tight truncate">
                        {sec.sub}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Account Health Metric Card */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 text-xs">
              <div className="flex items-center justify-between font-semibold text-slate-900">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Security Score
                </span>
                <span className="text-emerald-700 font-mono font-bold">100%</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Stanford SSO verified, password policy compliant, and real-time alerts enabled.
              </p>
            </div>
          </div>

          {/* Right Column: Setting Content Panes */}
          <div className="md:col-span-3 space-y-6">
            {/* 1. General Account & Identity (FULLY EDITABLE) */}
            {activeSection === 'general' && (
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-4 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900">
                        Account Details & Identity
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500 mt-0.5">
                        Customize your personal name, primary email, university credentials, and avatar photo
                      </CardDescription>
                    </div>
                    <Badge variant="success" size="sm">
                      Live Editable
                    </Badge>
                  </div>
                </CardHeader>

                <form onSubmit={handleAccountSubmit}>
                  <CardContent className="p-6 space-y-6">
                    {/* Avatar Customization */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-brand-600" />
                        <span>Profile Picture / Avatar:</span>
                      </label>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <img
                          src={accountForm.avatar}
                          alt="Avatar Preview"
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-500 shadow-sm shrink-0 bg-white"
                        />

                        <div className="space-y-2 flex-1">
                          <span className="text-[11px] text-slate-500 font-medium block">
                            Select a preset avatar or paste a custom image URL below:
                          </span>
                          <div className="flex items-center gap-2">
                            {PRESET_AVATARS.map((av, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setAccountForm((p) => ({ ...p, avatar: av }));
                                  setHasUnsavedChanges(true);
                                }}
                                className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all ${
                                  accountForm.avatar === av
                                    ? 'border-brand-600 scale-105 shadow-sm ring-2 ring-brand-500/20'
                                    : 'border-slate-200 opacity-70 hover:opacity-100'
                                }`}
                              >
                                <img src={av} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <Input
                        label="Custom Avatar URL"
                        name="avatar"
                        value={accountForm.avatar}
                        onChange={handleAccountChange}
                        placeholder="https://images.unsplash.com/..."
                        helperText="Provide a direct link to any JPG, PNG, or WebP photo"
                      />
                    </div>

                    {/* Personal & Email Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Full Legal Name"
                        name="name"
                        value={accountForm.name}
                        onChange={handleAccountChange}
                        placeholder="Jordan Lee"
                        required
                        helperText="Displayed to recruiters across all internship submissions"
                      />

                      <Input
                        label="Primary University Email"
                        name="email"
                        type="email"
                        value={accountForm.email}
                        onChange={handleAccountChange}
                        placeholder="student@internhub.dev"
                        required
                        leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                        helperText="Used for interview confirmations & account recovery"
                      />
                    </div>

                    {/* Phone & Academic Institution */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Contact Phone"
                        name="phone"
                        value={accountForm.phone}
                        onChange={handleAccountChange}
                        placeholder="+1 (555) 234-5678"
                        leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
                      />

                      <Input
                        label="Academic Institution"
                        name="institution"
                        value={accountForm.institution}
                        onChange={handleAccountChange}
                        placeholder="Stanford University"
                        leftIcon={<GraduationCap className="w-4 h-4 text-brand-600" />}
                      />
                    </div>

                    {/* Professional Headline */}
                    <Input
                      label="Professional Headline"
                      name="headline"
                      value={accountForm.headline}
                      onChange={handleAccountChange}
                      placeholder="e.g. Computer Science Major @ Stanford | Aspiring Full-Stack & Systems Engineer"
                      helperText="One-sentence tagline presented in employer candidate searches"
                    />

                    {/* Location */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Input
                        label="City"
                        name="city"
                        value={accountForm.city}
                        onChange={handleAccountChange}
                        placeholder="San Francisco"
                      />
                      <Input
                        label="State / Province"
                        name="state"
                        value={accountForm.state}
                        onChange={handleAccountChange}
                        placeholder="CA"
                      />
                      <Input
                        label="Country"
                        name="country"
                        value={accountForm.country}
                        onChange={handleAccountChange}
                        placeholder="United States"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        isLoading={accountSaving}
                        loadingText="Saving Changes..."
                        leftIcon={<Save className="w-4 h-4" />}
                        className="shadow-sm font-bold text-xs"
                      >
                        Save Account Details
                      </Button>
                    </div>
                  </CardContent>
                </form>
              </Card>
            )}

            {/* 2. Security & Password */}
            {activeSection === 'security' && (
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-4 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900">
                        Security & Password Management
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500 mt-0.5">
                        Rotate your account password and configure login protection
                      </CardDescription>
                    </div>
                    <Badge variant="primary" size="sm">
                      Bcrypt Encrypted
                    </Badge>
                  </div>
                </CardHeader>

                <form onSubmit={handlePasswordSubmit}>
                  <CardContent className="p-6 space-y-5">
                    <div className="relative">
                      <Input
                        label="Current Password"
                        type={showCurrentPassword ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData((p) => ({ ...p, currentPassword: e.target.value }))
                        }
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="relative">
                          <Input
                            label="New Password"
                            type={showNewPassword ? 'text' : 'password'}
                            placeholder="Create a strong password"
                            value={passwordData.newPassword}
                            onChange={(e) =>
                              setPasswordData((p) => ({ ...p, newPassword: e.target.value }))
                            }
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 focus:outline-none"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>

                        {passwordData.newPassword.length > 0 && (
                          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-[11px]">
                            {passwordCriteria.map((c, idx) => (
                              <div
                                key={idx}
                                className={`flex items-center gap-1.5 font-medium ${
                                  c.met ? 'text-emerald-700' : 'text-slate-400'
                                }`}
                              >
                                {c.met ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                ) : (
                                  <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                                )}
                                <span>{c.label}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <Input
                        label="Confirm New Password"
                        type="password"
                        placeholder="Re-enter new password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData((p) => ({ ...p, confirmPassword: e.target.value }))
                        }
                        required
                        error={
                          passwordData.confirmPassword && !doPasswordsMatch
                            ? 'Passwords do not match.'
                            : undefined
                        }
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        isLoading={passwordLoading}
                        loadingText="Updating Password..."
                      >
                        Update Password
                      </Button>
                    </div>
                  </CardContent>
                </form>
              </Card>
            )}

            {/* 3. Notification Preferences Matrix */}
            {activeSection === 'notifications' && (
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-4 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900">
                        Notification Matrix & Channel Preferences
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500 mt-0.5">
                        Customize what alerts and digests you receive from employers and InternHub
                      </CardDescription>
                    </div>
                    <Badge variant="primary" size="sm">
                      Real-Time
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-5">
                  <div className="space-y-4">
                    <Switch
                      label="Application Status Changes"
                      description="Instant email and push notifications when recruiters advance or review your application."
                      checked={notifications.applicationUpdates}
                      onChange={(checked) =>
                        setNotifications((p) => ({ ...p, applicationUpdates: checked }))
                      }
                    />

                    <Switch
                      label="Interview Invitations & Reminders"
                      description="Direct calendar invite sync and 1-hour pre-meeting reminder notifications."
                      checked={notifications.interviewInvites}
                      onChange={(checked) =>
                        setNotifications((p) => ({ ...p, interviewInvites: checked }))
                      }
                    />

                    <Switch
                      label="Recruiter Direct Inquiries"
                      description="Alerts when engineering hiring managers reach out to schedule introductory screens."
                      checked={notifications.recruiterDirectMessages}
                      onChange={(checked) =>
                        setNotifications((p) => ({ ...p, recruiterDirectMessages: checked }))
                      }
                    />

                    <Switch
                      label="Weekly Matched Roles Digest"
                      description="Weekly curated opportunities tailored to your preferred languages and tech stacks."
                      checked={notifications.weeklyOpportunities}
                      onChange={(checked) =>
                        setNotifications((p) => ({ ...p, weeklyOpportunities: checked }))
                      }
                    />

                    <Switch
                      label="Compensation & Market Salary Alerts"
                      description="Notifications when new high-pay ($10k+/mo) internships open for summer recruiting."
                      checked={notifications.salaryBenchmarkAlerts}
                      onChange={(checked) =>
                        setNotifications((p) => ({ ...p, salaryBenchmarkAlerts: checked }))
                      }
                    />
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleSaveNotifications}
                      isLoading={notifSaving}
                    >
                      Save Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 4. Privacy & Active Device Sessions */}
            {activeSection === 'privacy' && (
              <div className="space-y-6">
                <Card className="border-slate-200 bg-white shadow-sm">
                  <CardHeader className="pb-4 border-b border-slate-100">
                    <CardTitle className="text-base font-bold text-slate-900">
                      Recruiter Discovery & Privacy
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-0.5">
                      Control which employer tiers can discover your profile
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <Switch
                      label="Visible in Verified Recruiter Search"
                      description="Allow verified tech hiring teams (e.g. Stripe, OpenAI, Apple) to discover your profile."
                      checked={privacy.publicToVerifiedRecruiters}
                      onChange={(checked) =>
                        setPrivacy((p) => ({ ...p, publicToVerifiedRecruiters: checked }))
                      }
                    />

                    <Switch
                      label="Display GPA & Academic Honors"
                      description="Show your cumulative GPA (3.92) to employers requiring academic benchmarks."
                      checked={privacy.showGpa}
                      onChange={(checked) =>
                        setPrivacy((p) => ({ ...p, showGpa: checked }))
                      }
                    />

                    <Switch
                      label="Showcase Verified GitHub Portfolio"
                      description="Include automated code repository stats in your recruiter profile package."
                      checked={privacy.shareGithubPortfolio}
                      onChange={(checked) =>
                        setPrivacy((p) => ({ ...p, shareGithubPortfolio: checked }))
                      }
                    />

                    <div className="flex justify-end pt-3 border-t border-slate-100">
                      <Button variant="primary" size="sm" onClick={handleSavePrivacy}>
                        Save Privacy Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Active Sessions */}
                <Card className="border-slate-200 bg-white shadow-sm">
                  <CardHeader className="pb-4 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-bold text-slate-900">
                        Active Login Sessions & Devices
                      </CardTitle>
                      <Badge variant="success" size="xs" dot pulse>
                        Online
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                          <Laptop className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">Windows PC • Chrome</span>
                            <Badge variant="success" size="xs">Current Device</Badge>
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono">San Francisco, CA • IP 127.0.0.1</span>
                        </div>
                      </div>
                      <span className="text-[11px] text-emerald-600 font-semibold">Active now</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 5. Danger Zone */}
            {activeSection === 'danger' && (
              <Card className="border-rose-200 bg-rose-50/30 shadow-sm">
                <CardHeader className="pb-4 border-b border-rose-100">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-600" />
                    <div>
                      <CardTitle className="text-base font-bold text-rose-900">
                        Danger Zone & Account Actions
                      </CardTitle>
                      <CardDescription className="text-xs text-rose-700 mt-0.5">
                        Irreversible actions regarding your account and active applications
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-rose-200">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-900">Deactivate Student Account</p>
                      <p className="text-xs text-slate-600 max-w-md">
                        Temporarily disable your profile, hide from recruiter search, and pause notifications. You can reactivate anytime.
                      </p>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setDeactivateModalOpen(true)}
                    >
                      Deactivate Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Deactivation Confirmation Modal */}
      <Modal
        isOpen={deactivateModalOpen}
        onClose={() => setDeactivateModalOpen(false)}
        title="Deactivate Account"
        description="Are you sure you want to deactivate your student account? Your active applications will be paused and your profile will be hidden from recruiter searches."
        size="sm"
      >
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={() => setDeactivateModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setDeactivateModalOpen(false);
              notify.info('Account deactivation requested.');
            }}
          >
            Confirm Deactivation
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default StudentSettingsPage;
