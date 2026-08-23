import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import StudentNav from '../components/StudentNav.jsx';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Switch,
  Alert,
  Modal,
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
} from 'lucide-react';

export function StudentSettingsPage() {
  const { user } = useSelector((state) => state.auth);

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    applicationUpdates: true,
    interviewInvites: true,
    weeklyOpportunities: false,
    marketingEmails: false,
  });

  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);

  // Password criteria tracker
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
      // Simulate password change API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      notify.success('Password changed successfully.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSaveNotifications = () => {
    notify.success('Notification preferences updated.');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <StudentNav />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Account Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Manage your account security, contact email, and notification preferences.
          </p>
        </div>

        {/* 1. Account Details */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-brand-600" />
              <CardTitle className="text-sm font-bold text-slate-900">Account Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name" value={user?.name || ''} disabled helperText="Managed in profile" />
              <Input label="Primary Email" value={user?.email || ''} disabled helperText="Contact support to change email" />
            </div>
          </CardContent>
        </Card>

        {/* 2. Change Password */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-brand-600" />
              <CardTitle className="text-sm font-bold text-slate-900">Security & Password</CardTitle>
            </div>
          </CardHeader>
          <form onSubmit={handlePasswordSubmit}>
            <CardContent className="p-6 space-y-4">
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••••••"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData((p) => ({ ...p, currentPassword: e.target.value }))
                }
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Input
                    label="New Password"
                    type="password"
                    placeholder="Create a new strong password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData((p) => ({ ...p, newPassword: e.target.value }))
                    }
                    required
                  />

                  {passwordData.newPassword.length > 0 && (
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1 text-[11px]">
                      {passwordCriteria.map((c, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center gap-1.5 ${
                            c.met ? 'text-emerald-700' : 'text-slate-400'
                          }`}
                        >
                          {c.met ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-slate-400" />}
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
                  loadingText="Updating..."
                >
                  Update Password
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>

        {/* 3. Notifications */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-brand-600" />
              <CardTitle className="text-sm font-bold text-slate-900">Notification Preferences</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-4">
              <Switch
                label="Application Status Updates"
                description="Receive instant email notifications when recruiters update your application stage."
                checked={notifications.applicationUpdates}
                onChange={(checked) =>
                  setNotifications((p) => ({ ...p, applicationUpdates: checked }))
                }
              />

              <Switch
                label="Interview Invitations"
                description="Get calendar invites and reminders for upcoming interview sessions."
                checked={notifications.interviewInvites}
                onChange={(checked) =>
                  setNotifications((p) => ({ ...p, interviewInvites: checked }))
                }
              />

              <Switch
                label="Weekly Recommended Opportunities"
                description="Receive curated internship postings matching your skills and preferences."
                checked={notifications.weeklyOpportunities}
                onChange={(checked) =>
                  setNotifications((p) => ({ ...p, weeklyOpportunities: checked }))
                }
              />
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button variant="secondary" size="sm" onClick={handleSaveNotifications}>
                Save Preferences
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 4. Danger Zone */}
        <Card className="border-rose-200 bg-rose-50/40 shadow-sm">
          <CardHeader className="pb-3 border-b border-rose-100">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <CardTitle className="text-sm font-bold text-rose-700">Danger Zone</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">Deactivate Account</p>
              <p className="text-xs text-slate-600">
                Temporarily disable your profile and withdraw active applications.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setDeactivateModalOpen(true)}
            >
              Deactivate Account
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Deactivation Modal */}
      <Modal
        isOpen={deactivateModalOpen}
        onClose={() => setDeactivateModalOpen(false)}
        title="Deactivate Account"
        description="Are you sure you want to deactivate your student account? You can reactivate anytime by signing back in."
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
