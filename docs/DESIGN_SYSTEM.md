# InternHub — Design System Specification

> **Version:** 1.0.0  
> **Status:** Active & Implemented  
> **Target:** Modern, Premium, Trustworthy SaaS Experience

---

## Table of Contents

1. [Design Philosophy & Principles](#1-design-philosophy--principles)
2. [Foundations & Tokens](#2-foundations--tokens)
   - [Typography](#typography)
   - [Color System](#color-system)
   - [Spacing & Layout Grid](#spacing--layout-grid)
   - [Elevation & Shadows](#elevation--shadows)
   - [Border Radius](#border-radius)
   - [Animations & Transitions](#animations--transitions)
3. [Responsive Strategy & Breakpoints](#3-responsive-strategy--breakpoints)
4. [Accessibility (a11y) Standards](#4-accessibility-a11y-standards)
5. [Component Catalog & API Reference](#5-component-catalog--api-reference)
   - [Buttons](#buttons)
   - [Form Controls (Input, Textarea, Select)](#form-controls)
   - [Selection Controls (Checkbox, Radio, Switch)](#selection-controls)
   - [Cards](#cards)
   - [Badges](#badges)
   - [Alerts](#alerts)
   - [Modals & Dialogs](#modals--dialogs)
   - [Dropdown Menus](#dropdown-menus)
   - [Tabs](#tabs)
   - [Breadcrumbs](#breadcrumbs)
   - [Pagination](#pagination)
   - [Data Tables](#data-tables)
   - [Avatars & Avatar Groups](#avatars)
   - [Skeleton Loaders](#skeleton-loaders)
   - [Empty & Error States](#empty--error-states)
   - [Spinners & Toasts](#spinners--toasts)

---

## 1. Design Philosophy & Principles

InternHub is an enterprise-grade platform connecting verified students with world-class engineering teams and recruiters. The UI is designed to inspire **trust, speed, clarity, and precision**.

### Core Tenets:
1. **Clean & Minimal:** Avoid visual clutter, distracting gradients, or decorative noise. Content and metrics take center stage.
2. **Predictable & Accessible:** Every interaction has clear focus indicators, keyboard support, screen-reader semantics, and high contrast.
3. **Consistent Hierarchy:** Structured font sizing, deliberate spacing rhythms, and standard surface elevations.
4. **Purposeful Feedback:** Status badges, subtle skeleton loaders, and non-intrusive toasts keep users informed without friction.

---

## 2. Foundations & Tokens

### Typography

InternHub uses **Inter** for all UI body text and headings, paired with **JetBrains Mono** for numerical statistics, status identifiers, and timestamps.

| Token | Size | Line Height | Weight | Tailwind Class | Primary Usage |
|---|---|---|---|---|---|
| `display-1` | 30px / 36px | 1.2 | 700 (Bold) | `text-2xl sm:text-3xl font-bold` | Page hero titles |
| `h1` | 24px / 28px | 1.25 | 600 (Semibold) | `text-xl sm:text-2xl font-semibold` | Section headlines |
| `h2` | 18px / 22px | 1.3 | 600 (Semibold) | `text-base sm:text-lg font-semibold` | Card titles, modal headers |
| `h3` | 16px / 20px | 1.35 | 600 (Semibold) | `text-sm sm:text-base font-semibold` | Subheaders, table headers |
| `body-base` | 14px / 20px | 1.5 | 400 (Regular) | `text-sm text-slate-300` | Default body copy, inputs |
| `body-sm` | 12px / 16px | 1.4 | 400 (Regular) | `text-xs text-slate-400` | Helper text, secondary copy |
| `caption` | 11px / 14px | 1.3 | 500 (Medium) | `text-[11px] font-mono text-slate-500` | Timestamps, counters, badges |

### Color System

InternHub uses a high-contrast dark surface palette with precise semantic accent scales.

#### Slate Surfaces (Background & Structure)
- `slate-950` (`#020617`): Root body background
- `slate-900` (`#0f172a`): Card backgrounds, modal dialogs, dropdowns
- `slate-800` (`#1e293b`): Subtle card hover, borders, secondary buttons
- `slate-700` (`#334155`): Input borders, dividers, disabled states
- `slate-400` (`#94a3b8`): Secondary text, icon fills
- `slate-100` (`#f1f5f9`): Primary high-contrast text

#### Brand Scale (Indigo / Trust)
- `brand-400` (`#818cf8`): Active links, highlight accents
- `brand-500` (`#6366f1`): Interactive hover states, focus rings
- `brand-600` (`#4f46e5`): Primary buttons, active tabs, selected states
- `brand-900` (`#312e81`): Subtle primary badge backgrounds

#### Semantic Feedback Scales
| Role | Color Family | 500 Value | Surface Tint (`/10`) | Border Tint (`/30`) | Text Color |
|---|---|---|---|---|---|
| **Success** | Emerald | `#10b981` | `bg-success-500/10` | `border-success-500/30` | `text-success-300` |
| **Warning** | Amber | `#f59e0b` | `bg-warning-500/10` | `border-warning-500/30` | `text-warning-300` |
| **Danger** | Rose | `#f43f5e` | `bg-danger-500/10` | `border-danger-500/30` | `text-danger-300` |
| **Info** | Sky | `#0ea5e9` | `bg-info-500/10` | `border-info-500/30` | `text-info-300` |

### Spacing & Layout Grid

Spacing adheres strictly to a 4px/8px modular base:
- `gap-1.5` / `p-1.5` (6px): Badges, icon buttons
- `gap-2` / `p-2` (8px): Button padding, input gaps
- `gap-3` / `p-3` (12px): Form fields, list items
- `gap-4` / `p-4` (16px): Compact card padding, alerts
- `gap-6` / `p-6` (24px): Standard card padding, modal content
- `space-y-8` (32px): Inter-section spacing
- `space-y-16` (64px): Major page division spacing

### Elevation & Shadows

```css
shadow-subtle: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
shadow-card: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
shadow-card-hover: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
shadow-dropdown: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
shadow-modal: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

### Border Radius
- `rounded-lg` (`8px`): Buttons, Inputs, Badges, Table Rows
- `rounded-xl` (`12px`): Cards, Dropdown Menus, Alerts, Toasts
- `rounded-2xl` (`16px`): Modals, Empty State containers
- `rounded-full` (`9999px`): Avatars, Status Pills, Switches

---

## 3. Responsive Strategy & Breakpoints

InternHub is engineered mobile-first across all 8 target widths:

| Breakpoint | Target Device | Layout Behavior |
|---|---|---|
| `320px` | Small Mobile | Single column, stacked actions, full-width inputs |
| `375px` (`xs`) | Standard Mobile (iPhone) | Standard mobile layouts, hidden auxiliary badges |
| `425px` | Large Mobile | Form grid begins splitting, 2-column small toggles |
| `768px` (`md`) | Tablet / iPad | 2-column card layouts, tables gain horizontal scroll |
| `1024px` (`lg`) | Small Laptop / Desktop | Full sidebars visible, 3-column metric grids |
| `1280px` (`xl`) | Standard Desktop (1080p) | 4-column metric grids, full table data views |
| `1440px` (`2xl`) | Large Desktop Display | Max-width content constraint (`max-w-7xl`) |
| `1920px+` (`3xl`) | Ultra-wide / 4K | Centered content with symmetric background gutters |

---

## 4. Accessibility (a11y) Standards

1. **Focus Ring:** Every interactive element has a visible, high-contrast ring:
   ```css
   :focus-visible { outline: none; ring-2 ring-brand-500 ring-offset-2 ring-offset-slate-900; }
   ```
2. **Keyboard Traps & Escape Listeners:** Modals and dropdowns trap focus or close on `Escape` without triggering ancestor handlers.
3. **Explicit Form Labels:** All input components generate deterministic matching IDs via `useId()` and pair with `htmlFor`.
4. **Accessible Error Messaging:** Form inputs link errors via `aria-describedby="[id]-error"` and set `aria-invalid="true"`.
5. **No Color-Only Information:** Status indicators accompany text labels or distinct icons in addition to color.

---

## 5. Component Catalog & API Reference

All components are exported from `client/src/components/ui/index.js`.

### Buttons
```jsx
import { Button } from '@/components/ui';

// Variants
<Button variant="primary">Submit Application</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="outline">Export CSV</Button>
<Button variant="ghost">View Details</Button>
<Button variant="danger">Delete Posting</Button>
<Button variant="success">Accept Candidate</Button>
<Button variant="link">Forgot Password?</Button>

// Interactive States
<Button isLoading={true} loadingText="Saving...">Save</Button>
<Button leftIcon={<Plus className="w-4 h-4" />}>Add Item</Button>
<Button size="xs" | "sm" | "md" | "lg" | "icon">Size Variant</Button>
```

### Form Controls
```jsx
import { Input, Textarea, Select } from '@/components/ui';

<Input
  label="Candidate Email"
  type="email"
  placeholder="alex@stanford.edu"
  leftIcon={<Mail className="w-4 h-4" />}
  required
  helperText="Official university email required"
/>

<Input
  label="Password"
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>

<Textarea
  label="Cover Letter"
  maxLength={500}
  rows={4}
  helperText="Explain your background in 500 characters or less."
/>

<Select
  label="Graduation Year"
  options={[
    { value: '2026', label: 'Class of 2026' },
    { value: '2027', label: 'Class of 2027' },
  ]}
/>
```

### Selection Controls
```jsx
import { Checkbox, Radio, Switch } from '@/components/ui';

<Checkbox
  label="Remote Only"
  description="Show only verified remote opportunities"
  checked={isRemote}
  onChange={(e) => setIsRemote(e.target.checked)}
/>

<Radio
  name="employment_type"
  value="fulltime"
  label="Full-Time Internship"
  checked={selectedType === 'fulltime'}
  onChange={() => setSelectedType('fulltime')}
/>

<Switch
  label="Email Notifications"
  checked={notificationsEnabled}
  onChange={(e) => setNotificationsEnabled(e.target.checked)}
/>
```

### Cards
```jsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui';

<Card hoverable>
  <CardHeader>
    <CardTitle>Stripe — Software Engineer Intern</CardTitle>
    <CardDescription>San Francisco, CA • $65/hour</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-slate-300">Work directly with core payments infrastructure...</p>
  </CardContent>
  <CardFooter className="justify-between">
    <Badge variant="primary" dot>Active</Badge>
    <Button size="xs">Apply Now</Button>
  </CardFooter>
</Card>
```

### Modals & Dialogs
```jsx
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@/components/ui';

<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="md">
  <ModalHeader>
    <ModalTitle>Schedule Technical Screen</ModalTitle>
  </ModalHeader>
  <ModalBody>
    <p>Invite candidate for round 1 interview.</p>
  </ModalBody>
  <ModalFooter>
    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
    <Button variant="primary">Confirm</Button>
  </ModalFooter>
</Modal>
```

### Dropdowns
```jsx
import { Dropdown, DropdownItem, DropdownHeader, DropdownDivider } from '@/components/ui';

<Dropdown trigger={<Button variant="secondary">Actions</Button>}>
  <DropdownHeader>Applicant Actions</DropdownHeader>
  <DropdownItem icon={<Check className="w-4 h-4" />} shortcut="⌘S">
    Shortlist
  </DropdownItem>
  <DropdownDivider />
  <DropdownItem danger icon={<Trash className="w-4 h-4" />}>
    Reject
  </DropdownItem>
</Dropdown>
```

### Data Tables
```jsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead sortable onSort={handleSort}>Candidate</TableHead>
      <TableHead>Role</TableHead>
      <TableHead align="right">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Sarah Jenkins</TableCell>
      <TableCell>Frontend Intern</TableCell>
      <TableCell align="right"><Button size="xs">Review</Button></TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Toasts
```jsx
import { notify } from '@/utils/toast';

notify.success('Application submitted successfully!');
notify.error('Failed to connect to database.');
notify.info('New message received.');
notify.promise(uploadPromise, {
  loading: 'Uploading resume PDF...',
  success: 'Resume saved to Cloudinary!',
  error: 'Upload error.',
});
```

---

*End of DESIGN_SYSTEM.md*
