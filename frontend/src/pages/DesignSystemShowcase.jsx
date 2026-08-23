import React, { useState } from 'react';
import {
  Button,
  Badge,
  Input,
  Textarea,
  Select,
  Checkbox,
  Radio,
  Switch,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Alert,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  Dropdown,
  DropdownItem,
  DropdownDivider,
  DropdownHeader,
  Tabs,
  TabList,
  TabTrigger,
  TabContent,
  Breadcrumbs,
  Pagination,
  Avatar,
  AvatarGroup,
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonTable,
  EmptyState,
  ErrorState,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../components/ui/index.js';
import { notify } from '../utils/toast.js';
import {
  Sparkles,
  Search,
  Mail,
  Lock,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  ChevronDown,
  Download,
  Share2,
  Briefcase,
  Home,
  CheckCircle,
  Building2,
  MapPin,
  Clock,
  Layers,
  Code2,
} from 'lucide-react';

export function DesignSystemShowcase() {
  // State for interactive demonstrations
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSize, setModalSize] = useState('md');
  const [buttonLoading, setButtonLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('SuperSecretPass123!');
  const [selectedRadio, setSelectedRadio] = useState('remote');
  const [checkboxState, setCheckboxState] = useState({
    frontend: true,
    backend: false,
    devops: true,
  });
  const [switchActive, setSwitchActive] = useState(true);
  const [currentPage, setCurrentPage] = useState(2);
  const [pageSize, setPageSize] = useState(10);
  const [sortDirection, setSortDirection] = useState('desc');

  const handleLoadingToggle = () => {
    setButtonLoading(true);
    setTimeout(() => {
      setButtonLoading(false);
      notify.success('Async action completed successfully!');
    }, 1500);
  };

  const handleToastPromise = () => {
    const simulateAsync = new Promise((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.3 ? resolve('Data synced') : reject(new Error('Network timeout'));
      }, 2000);
    });

    notify.promise(simulateAsync, {
      loading: 'Uploading candidate resume...',
      success: 'Resume verified and stored on Cloudinary!',
      error: 'Upload failed. Please check file size.',
    });
  };

  const sampleApplicants = [
    {
      id: 'APP-101',
      name: 'Sarah Jenkins',
      email: 'sarah.j@stanford.edu',
      role: 'Full Stack Engineer Intern',
      status: 'shortlisted',
      badgeVariant: 'success',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      gpa: '3.92',
      appliedAt: '2 hours ago',
    },
    {
      id: 'APP-102',
      name: 'Alex Rivera',
      email: 'alex.rivera@mit.edu',
      role: 'Backend Systems Intern',
      status: 'interviewing',
      badgeVariant: 'primary',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      gpa: '3.85',
      appliedAt: '5 hours ago',
    },
    {
      id: 'APP-103',
      name: 'Priya Sharma',
      email: 'priya.s@berkeley.edu',
      role: 'AI / Machine Learning Intern',
      status: 'pending',
      badgeVariant: 'warning',
      avatar: null,
      gpa: '4.00',
      appliedAt: '1 day ago',
    },
    {
      id: 'APP-104',
      name: 'Marcus Chen',
      email: 'm.chen@cmu.edu',
      role: 'Product Design Intern',
      status: 'rejected',
      badgeVariant: 'danger',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      gpa: '3.65',
      appliedAt: '3 days ago',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24 selection:bg-brand-500/20 selection:text-brand-700">
      {/* Top Hero Banner */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-slate-900">InternHub</span>
                <Badge variant="primary" size="sm">
                  Design System v2.0 (Light)
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 font-mono hidden sm:block">
                Production-grade SaaS Component Catalog
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="xs"
              leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
              onClick={() => window.open('/docs/LIGHT_THEME_MIGRATION.md', '_blank')}
            >
              Docs
            </Button>
            <Button
              variant="primary"
              size="xs"
              onClick={handleToastPromise}
            >
              Test Notification
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Showcase */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-16">
        {/* Intro */}
        <section className="space-y-3">
          <Breadcrumbs
            items={[
              { label: 'InternHub', icon: <Home className="w-3.5 h-3.5" /> },
              { label: 'Architecture & Design' },
              { label: 'Component Catalog' },
            ]}
          />
          <div className="pt-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Design System & Component Showcase
            </h1>
            <p className="text-sm text-slate-600 mt-1.5 max-w-3xl leading-relaxed">
              Every component is built mobile-first, accessible, responsive, and styled to feel
              clean, trustworthy, and minimal for the InternHub multi-role platform in pure Light Mode.
            </p>
          </div>

          {/* Viewport Test Bar */}
          <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs shadow-xs">
            <span className="text-slate-600 font-medium flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-brand-600" />
              Responsive Breakpoints:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {['320px', '375px', '425px', '768px (md)', '1024px (lg)', '1280px (xl)', '1440px (2xl)', '1920px+'].map(
                (target) => (
                  <span
                    key={target}
                    className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px]"
                  >
                    {target}
                  </span>
                )
              )}
            </div>
          </div>
        </section>

        {/* 1. TYPOGRAPHY & COLORS */}
        <section className="space-y-6">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-brand-600" />
                1. Typography & Palette Tokens
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Font family: Inter (sans-serif) & JetBrains Mono (code/metrics)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Typography Scale</CardTitle>
                <CardDescription>Hierarchy tested against WCAG contrast standards</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-[11px] font-mono text-slate-400 block">Display / H1 (30px / 700)</span>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    Discover Elite Tech Internships
                  </h1>
                </div>
                <div>
                  <span className="text-[11px] font-mono text-slate-400 block">Heading 2 (24px / 600)</span>
                  <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 tracking-tight">
                    Recruiter Management Dashboard
                  </h2>
                </div>
                <div>
                  <span className="text-[11px] font-mono text-slate-400 block">Heading 3 (18px / 600)</span>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800">
                    Application Review Pipeline
                  </h3>
                </div>
                <div>
                  <span className="text-[11px] font-mono text-slate-400 block">Body Base (14px / 400)</span>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    InternHub matches verified university students with leading tech engineering teams.
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-mono text-slate-400 block">Gradient Headline Utility</span>
                  <span className="text-gradient text-lg font-bold">
                    Supercharge your early career hiring.
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Color Tokens</CardTitle>
                <CardDescription>Semantic palettes with accessible text pairing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono text-slate-500">Brand Scale (Blue)</span>
                  <div className="grid grid-cols-6 gap-1.5 text-center text-[10px] font-mono text-white">
                    <div className="h-8 rounded bg-brand-400 text-slate-900 flex items-center justify-center">400</div>
                    <div className="h-8 rounded bg-brand-500 flex items-center justify-center">500</div>
                    <div className="h-8 rounded bg-brand-600 flex items-center justify-center font-bold ring-1 ring-white">600</div>
                    <div className="h-8 rounded bg-brand-700 flex items-center justify-center">700</div>
                    <div className="h-8 rounded bg-brand-800 flex items-center justify-center">800</div>
                    <div className="h-8 rounded bg-brand-900 flex items-center justify-center">900</div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-mono text-slate-500">Semantic Feedback Scales</span>
                  <div className="grid grid-cols-4 gap-2 text-xs font-medium">
                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-center">
                      Success
                    </div>
                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-center">
                      Warning
                    </div>
                    <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-center">
                      Danger
                    </div>
                    <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-center">
                      Info
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-mono text-slate-500">Surface Slate Palette</span>
                  <div className="grid grid-cols-4 gap-2 text-xs font-mono text-center">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800">slate-50</div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-900">white</div>
                    <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">slate-100</div>
                    <div className="p-2 rounded-lg bg-slate-200 text-slate-900 font-bold">border-200</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 2. BUTTONS & ACTIONS */}
        <section className="space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-slate-900">2. Buttons & Actions</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Variants, sizes, loading spinners, and icon configurations
            </p>
          </div>

          <Card>
            <CardContent className="space-y-6">
              {/* Variant Rows */}
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-3">
                  Button Variants
                </span>
                <div className="flex items-center gap-3 flex-wrap">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Danger</Button>
                  <Button variant="success">Success</Button>
                  <Button variant="link">Link Style</Button>
                  <Button variant="primary" disabled>
                    Disabled
                  </Button>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-3">
                  Button Sizes
                </span>
                <div className="flex items-center gap-3 flex-wrap">
                  <Button size="xs">Extra Small (xs)</Button>
                  <Button size="sm">Small (sm)</Button>
                  <Button size="md">Medium (md)</Button>
                  <Button size="lg">Large (lg)</Button>
                  <Button size="icon" aria-label="Add new">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Interactive Loading & Icons */}
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-3">
                  Interactive Loading & Icons
                </span>
                <div className="flex items-center gap-3 flex-wrap">
                  <Button
                    variant="primary"
                    isLoading={buttonLoading}
                    loadingText="Processing application..."
                    onClick={handleLoadingToggle}
                  >
                    Click to Test Loading
                  </Button>
                  <Button
                    variant="secondary"
                    leftIcon={<Briefcase className="w-4 h-4" />}
                  >
                    Apply Now
                  </Button>
                  <Button
                    variant="outline"
                    rightIcon={<Download className="w-4 h-4" />}
                  >
                    Export CSV
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Delete Posting
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 3. FORM CONTROLS */}
        <section className="space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-slate-900">3. Form Controls & Inputs</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Accessible, keyboard-navigable inputs with built-in validation states
            </p>
          </div>

          <Card>
            <CardContent className="space-y-6">
              {/* Text inputs grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <Input
                  label="Search Internships"
                  placeholder="e.g. React, Python, Remote..."
                  leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  showClearButton
                  onClear={() => setSearchValue('')}
                  helperText="Press Enter to execute search"
                />

                <Input
                  label="University Email"
                  type="email"
                  placeholder="student@university.edu"
                  leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                  required
                  helperText="Use your .edu email for verification"
                />

                <Input
                  label="Password Field"
                  type="password"
                  value={passwordValue}
                  onChange={(e) => setPasswordValue(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                  required
                  helperText="Click eye icon to toggle visibility"
                />

                <Input
                  label="Error State Input"
                  value="invalid-email-format"
                  error="Please provide a valid institutional email address."
                  leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                />

                <Select
                  label="Experience Level"
                  options={[
                    { value: 'all', label: 'All Levels' },
                    { value: 'undergrad', label: 'Undergraduate (Freshman/Sophomore)' },
                    { value: 'junior_senior', label: 'Junior / Senior' },
                    { value: 'masters', label: 'Master’s / Ph.D. Candidate' },
                  ]}
                  defaultValue="all"
                  helperText="Filters results by expected graduation date"
                />

                <Input
                  label="Disabled Input"
                  value="System Generated ID: #IH-9921"
                  disabled
                  helperText="This field is read-only"
                />
              </div>

              {/* Textarea */}
              <Textarea
                label="Cover Letter / Candidate Statement"
                placeholder="Describe your relevant project experience, technical passions, and what you hope to learn..."
                maxLength={500}
                rows={3}
                helperText="Keep statements concise and focused on engineering achievements."
              />

              {/* Toggles, Radios & Checkboxes */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <span className="text-xs font-semibold text-slate-700 block mb-3">
                    Role Interests (Checkboxes)
                  </span>
                  <div className="space-y-3">
                    <Checkbox
                      label="Frontend Engineering"
                      description="React, TypeScript, Next.js, UI/UX"
                      checked={checkboxState.frontend}
                      onChange={(e) =>
                        setCheckboxState((p) => ({ ...p, frontend: e.target.checked }))
                      }
                    />
                    <Checkbox
                      label="Backend & Cloud"
                      description="Node.js, Go, MongoDB, AWS"
                      checked={checkboxState.backend}
                      onChange={(e) =>
                        setCheckboxState((p) => ({ ...p, backend: e.target.checked }))
                      }
                    />
                    <Checkbox
                      label="DevOps & Infrastructure"
                      description="CI/CD, Docker, Kubernetes"
                      checked={checkboxState.devops}
                      onChange={(e) =>
                        setCheckboxState((p) => ({ ...p, devops: e.target.checked }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-700 block mb-3">
                    Workplace Preference (Radios)
                  </span>
                  <div className="space-y-3">
                    <Radio
                      name="location_pref"
                      value="remote"
                      label="Fully Remote"
                      description="Work from anywhere with verified timezone match"
                      checked={selectedRadio === 'remote'}
                      onChange={() => setSelectedRadio('remote')}
                    />
                    <Radio
                      name="location_pref"
                      value="hybrid"
                      label="Hybrid (2-3 days office)"
                      description="Relocation assistance provided"
                      checked={selectedRadio === 'hybrid'}
                      onChange={() => setSelectedRadio('hybrid')}
                    />
                    <Radio
                      name="location_pref"
                      value="onsite"
                      label="On-site Only"
                      description="Relocation assistance provided"
                      checked={selectedRadio === 'onsite'}
                      onChange={() => setSelectedRadio('onsite')}
                    />
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-700 block mb-3">
                    Notification Settings (Switches)
                  </span>
                  <div className="space-y-4">
                    <Switch
                      label="Interview Invites"
                      description="Real-time SMS & email notifications"
                      checked={switchActive}
                      onChange={(e) => setSwitchActive(e.target.checked)}
                    />
                    <Switch
                      label="Weekly Digest"
                      description="Summary of matching new internships"
                      checked={false}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 4. BADGES, ALERTS & TOASTS */}
        <section className="space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-slate-900">4. Badges, Alerts & Notifications</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Status pills, feedback banners, and toast triggers
            </p>
          </div>

          <div className="space-y-6">
            {/* Badges card */}
            <Card>
              <CardHeader>
                <CardTitle>Status & Category Badges</CardTitle>
                <CardDescription>Pills with live status dots, icons, and dismiss buttons</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <Badge variant="neutral">Neutral</Badge>
                  <Badge variant="primary" dot pulse>
                    Live Posting
                  </Badge>
                  <Badge variant="success" dot>
                    Accepted
                  </Badge>
                  <Badge variant="warning" dot>
                    Under Review
                  </Badge>
                  <Badge variant="danger" dot>
                    Rejected
                  </Badge>
                  <Badge variant="info">Verified Company</Badge>
                  <Badge variant="purple">Super Admin</Badge>
                  <Badge
                    variant="neutral"
                    onRemove={() => notify.info('Filter tag removed')}
                  >
                    Remote Only
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Alert
                variant="info"
                title="System Maintenance Scheduled"
                description="Database optimization scheduled for Sunday at 02:00 UTC. API response times will not be affected."
                dismissible
              />
              <Alert
                variant="success"
                title="Application Shortlisted"
                description="Congratulations! Stripe has invited you for a 45-minute technical screen."
                action={
                  <Button size="xs" variant="success">
                    View Interview Schedule
                  </Button>
                }
              />
              <Alert
                variant="warning"
                title="Profile 70% Complete"
                description="Upload your updated resume PDF to unlock 1-click applications."
                dismissible
              />
              <Alert
                variant="danger"
                title="Deadline Expired"
                description="Applications for this position closed on August 20, 2026."
              />
            </div>

            {/* Toast triggers */}
            <Card>
              <CardHeader>
                <CardTitle>Toast Notifications</CardTitle>
                <CardDescription>Click to trigger standard toast notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 flex-wrap">
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => notify.success('Profile updated successfully!')}
                  >
                    Success Toast
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => notify.error('Failed to connect to MongoDB Atlas.')}
                  >
                    Error Toast
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => notify.info('New internship matching your skills posted.')}
                  >
                    Info Toast
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleToastPromise}
                  >
                    Promise Toast (Async)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 5. MODALS & DROPDOWNS & TABS */}
        <section className="space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-slate-900">5. Modals, Dropdowns & Tabs</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Complex interactive overlays and view switchers
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Modal & Dropdown trigger card */}
            <Card>
              <CardHeader>
                <CardTitle>Interactive Modals & Dropdown Menus</CardTitle>
                <CardDescription>Accessible dialogs with focus trap and dropdown popovers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block mb-2.5">
                    Trigger Accessible Dialog
                  </span>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Button
                      variant="primary"
                      onClick={() => {
                        setModalSize('md');
                        setModalOpen(true);
                      }}
                    >
                      Open Modal (Medium)
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setModalSize('lg');
                        setModalOpen(true);
                      }}
                    >
                      Open Modal (Large)
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 block mb-2.5">
                    Action Dropdown Menu
                  </span>
                  <Dropdown
                    trigger={
                      <Button
                        variant="secondary"
                        rightIcon={<ChevronDown className="w-4 h-4" />}
                      >
                        Candidate Actions
                      </Button>
                    }
                  >
                    <DropdownHeader>Applicant Options</DropdownHeader>
                    <DropdownItem
                      icon={<CheckCircle className="w-4 h-4 text-emerald-600" />}
                      onClick={() => notify.success('Candidate shortlisted')}
                      shortcut="⌘S"
                    >
                      Shortlist Candidate
                    </DropdownItem>
                    <DropdownItem
                      icon={<Clock className="w-4 h-4 text-brand-600" />}
                      onClick={() => notify.info('Schedule modal triggered')}
                      shortcut="⌘I"
                    >
                      Schedule Interview
                    </DropdownItem>
                    <DropdownItem
                      icon={<Edit className="w-4 h-4 text-slate-600" />}
                      onClick={() => notify.info('Notes editor opened')}
                    >
                      Add Private Notes
                    </DropdownItem>
                    <DropdownDivider />
                    <DropdownItem
                      icon={<Trash2 className="w-4 h-4 text-red-600" />}
                      danger
                      onClick={() => notify.error('Candidate rejected')}
                    >
                      Reject Application
                    </DropdownItem>
                  </Dropdown>
                </div>
              </CardContent>
            </Card>

            {/* Tabs card */}
            <Card>
              <CardHeader>
                <CardTitle>Tab Component</CardTitle>
                <CardDescription>Segmented pill & underline styles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block mb-2">
                    Segmented Pill Variant
                  </span>
                  <Tabs defaultValue="all" variant="pills">
                    <TabList>
                      <TabTrigger value="all" badge="24">
                        All
                      </TabTrigger>
                      <TabTrigger value="active" badge="18">
                        Active
                      </TabTrigger>
                      <TabTrigger value="drafts" badge="6">
                        Drafts
                      </TabTrigger>
                    </TabList>
                    <TabContent value="all">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                        Displaying all 24 internship listings across all engineering departments.
                      </div>
                    </TabContent>
                    <TabContent value="active">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                        18 active listings receiving live applications.
                      </div>
                    </TabContent>
                    <TabContent value="drafts">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                        6 unpublished draft postings pending recruiter review.
                      </div>
                    </TabContent>
                  </Tabs>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 block mb-2">
                    Underline Variant
                  </span>
                  <Tabs defaultValue="overview" variant="line">
                    <TabList>
                      <TabTrigger value="overview">Overview</TabTrigger>
                      <TabTrigger value="analytics">Analytics</TabTrigger>
                      <TabTrigger value="settings">Settings</TabTrigger>
                    </TabList>
                    <TabContent value="overview">
                      <p className="text-xs text-slate-600">
                        Company overview, office locations, and verified recruiter roster.
                      </p>
                    </TabContent>
                    <TabContent value="analytics">
                      <p className="text-xs text-slate-600">
                        Real-time funnel conversion metrics from application to hire.
                      </p>
                    </TabContent>
                    <TabContent value="settings">
                      <p className="text-xs text-slate-600">
                        Manage company profile branding and hiring team permissions.
                      </p>
                    </TabContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 6. DATA TABLE & PAGINATION */}
        <section className="space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-slate-900">6. Responsive Data Table & Pagination</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Clean table with avatar badges, sortable headers, and pagination controls
            </p>
          </div>

          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>Real-time candidate submissions for Software Engineering</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="xs" leftIcon={<Download className="w-3.5 h-3.5" />}>
                  Export
                </Button>
                <Button variant="primary" size="xs" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                  Invite Candidate
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow hoverable={false}>
                    <TableHead
                      sortable
                      sortDirection={sortDirection}
                      onSort={() =>
                        setSortDirection((p) => (p === 'asc' ? 'desc' : 'asc'))
                      }
                    >
                      Candidate
                    </TableHead>
                    <TableHead>Target Role</TableHead>
                    <TableHead>GPA</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead align="right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleApplicants.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={app.avatar}
                            name={app.name}
                            size="sm"
                            status="online"
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 truncate">
                              {app.name}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {app.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-slate-700">{app.role}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-slate-700 font-medium">{app.gpa}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={app.badgeVariant} size="sm" dot>
                          {app.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-slate-500">{app.appliedAt}</span>
                      </TableCell>
                      <TableCell align="right">
                        <Dropdown
                          trigger={
                            <button className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-900">
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          }
                        >
                          <DropdownItem onClick={() => notify.info(`Viewing ${app.name}`)}>
                            View Profile
                          </DropdownItem>
                          <DropdownItem onClick={() => notify.success(`Shortlisted ${app.name}`)}>
                            Shortlist
                          </DropdownItem>
                          <DropdownDivider />
                          <DropdownItem danger onClick={() => notify.error(`Rejected ${app.name}`)}>
                            Reject
                          </DropdownItem>
                        </Dropdown>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Pagination
                currentPage={currentPage}
                totalPages={8}
                totalItems={78}
                pageSize={pageSize}
                onPageChange={(page) => setCurrentPage(page)}
                onPageSizeChange={(size) => setPageSize(size)}
                className="w-full"
              />
            </CardFooter>
          </Card>
        </section>

        {/* 7. AVATARS, SKELETONS & EMPTY/ERROR STATES */}
        <section className="space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-slate-900">
              7. Avatars, Skeletons, Empty & Error States
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Loaders and zero-data states for robust application handling
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Avatars Card */}
            <Card>
              <CardHeader>
                <CardTitle>Avatars & Groups</CardTitle>
                <CardDescription>Sizes, deterministic hash initials, and status indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block mb-3">
                    Avatar Sizes & Status Badges
                  </span>
                  <div className="flex items-center gap-4 flex-wrap">
                    <Avatar size="xs" name="Alex Rivera" status="online" />
                    <Avatar size="sm" name="Sarah Jenkins" status="busy" />
                    <Avatar size="md" name="Marcus Chen" status="away" />
                    <Avatar size="lg" name="Priya Sharma" status="offline" />
                    <Avatar size="xl" name="Rahul Valluri" status="online" />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 block mb-3">
                    Stacked Avatar Group
                  </span>
                  <AvatarGroup size="md" max={4}>
                    <Avatar name="Sarah J" />
                    <Avatar name="Alex Rivera" />
                    <Avatar name="Priya Sharma" />
                    <Avatar name="Marcus Chen" />
                    <Avatar name="David Kim" />
                    <Avatar name="Elena Rostova" />
                  </AvatarGroup>
                </div>
              </CardContent>
            </Card>

            {/* Skeletons Card */}
            <Card>
              <CardHeader>
                <CardTitle>Skeleton Loaders</CardTitle>
                <CardDescription>Subtle shimmer animation during async fetches</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <SkeletonAvatar size="md" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
                <SkeletonText lines={2} />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-24 rounded-lg" />
                  <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Empty & Error States Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EmptyState
              title="No Saved Internships Yet"
              description="Browse the discovery page and click the bookmark icon on any opportunity to save it here for later review."
              primaryAction={
                <Button size="sm" variant="primary" leftIcon={<Search className="w-4 h-4" />}>
                  Discover Internships
                </Button>
              }
              secondaryAction={
                <Button size="sm" variant="outline">
                  Learn More
                </Button>
              }
            />

            <ErrorState
              title="Failed to Load Recruiter Analytics"
              message="The analytics aggregation service timed out while querying the database."
              onRetry={() => notify.info('Retrying data query...')}
              error={new Error('MongoNetworkError: connection timed out after 5000ms at src/services/analytics.service.js:42')}
              primaryAction={
                <Button size="sm" variant="secondary">
                  Check Status Page
                </Button>
              }
            />
          </div>
        </section>
      </main>

      {/* Interactive Modal Demonstration */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        size={modalSize}
      >
        <ModalHeader>
          <ModalTitle>Schedule Technical Screen</ModalTitle>
          <ModalDescription>
            Invite Sarah Jenkins to a 45-minute Live Coding Interview
          </ModalDescription>
        </ModalHeader>
        <ModalBody className="space-y-4">
          <Input
            label="Meeting Title"
            defaultValue="InternHub Technical Interview — Round 1"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Date" type="date" defaultValue="2026-08-28" />
            <Input label="Time" type="time" defaultValue="14:00" />
          </div>
          <Select
            label="Interview Type"
            options={[
              { value: 'video', label: 'Google Meet / Video' },
              { value: 'phone', label: 'Phone Screening' },
              { value: 'takehome', label: 'Take-home Assignment Review' },
            ]}
            defaultValue="video"
          />
          <Textarea
            label="Interviewer Notes & Instructions"
            placeholder="Include meeting link, agenda, or preparation links for the candidate..."
            rows={3}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setModalOpen(false);
              notify.success('Interview invitation sent to candidate!');
            }}
          >
            Confirm & Send Invite
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default DesignSystemShowcase;
