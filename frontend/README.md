# InternHub — Frontend Client Application

<div align="center">

**A modern, responsive React 19 Single Page Application (SPA) built with Vite, Tailwind CSS, and Redux Toolkit.**

[![React Version](https://img.shields.io/badge/react-19.x-61DAFB.svg?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/vite-5.x-646CFF.svg?style=flat-square&logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/tailwindcss-3.4-38B2AC.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)
[![Redux Toolkit](https://img.shields.io/badge/redux--toolkit-2.x-764ABC.svg?style=flat-square&logo=redux)](https://redux-toolkit.js.org)

</div>

---

## 📖 Overview

The `frontend/` directory contains the complete user-facing frontend application for **InternHub**. It provides dedicated portals for **Students**, **Recruiters**, and **Platform Administrators**, along with a high-performance public internship discovery experience, atomic design system, and responsive layouts across all device sizes.

---

## 📂 Architecture & Directory Structure

```text
frontend/
├── public/                       # Static public assets (favicon.svg, robots.txt, sitemap.xml)
├── src/
│   ├── components/
│   │   ├── common/               # Shared cross-cutting components
│   │   │   ├── Navbar.jsx        # Responsive navigation header with mobile drawer
│   │   │   ├── Footer.jsx        # SaaS multi-column footer & newsletter
│   │   │   ├── SEOHead.jsx       # Dynamic OpenGraph, Twitter & Schema.org JSON-LD tags
│   │   │   └── ErrorBoundary.jsx # Global error boundary fallback handler
│   │   │
│   │   └── ui/                   # Reusable Atomic Design System Primitives
│   │       ├── Button.jsx        # Variants: primary, secondary, outline, ghost, danger
│   │       ├── Modal.jsx         # Accessible dialogs with auto-scroll containment
│   │       ├── Card.jsx          # Header, Title, Content, Footer compound cards
│   │       ├── Table.jsx         # Sortable, responsive data table with empty states
│   │       ├── Pagination.jsx    # Compact responsive pagination controls
│   │       ├── Input.jsx         # Form text, email, date, and password inputs
│   │       ├── Select.jsx        # Custom accessible select dropdowns
│   │       ├── Dropdown.jsx      # Action menus with mobile viewport bounds
│   │       ├── Tabs.jsx          # Accessible tab list and panels
│   │       ├── Badge.jsx         # Status pill badges with pulse indicators
│   │       ├── Avatar.jsx        # User profile avatars with initials fallback
│   │       ├── Skeleton.jsx      # Shimmer placeholder skeleton loaders
│   │       └── EmptyState.jsx    # Contextual empty state illustrations & CTAs
│   │
│   ├── features/                 # Domain-Driven Feature Modules
│   │   ├── admin/                # Admin operations, audit logs, KPI charts, moderation
│   │   ├── applications/         # Application forms, review queues, status timelines
│   │   ├── auth/                 # Login, registration, password reset, token lifecycle
│   │   ├── companies/            # Company directory, public profiles, verification
│   │   ├── internships/          # Discovery explorer, search, filter drawer, detail view
│   │   ├── interviews/           # Calendar agenda, scheduling modals, video call links
│   │   ├── notifications/        # Bell badge, dropdown popup, notification center
│   │   └── student/              # Profile builder, resume manager, student dashboard
│   │
│   ├── hooks/                    # Custom React Hooks
│   │   ├── useAuth.js            # Auth context selector & credentials state
│   │   ├── useDebounce.js        # Search input debounce wrapper
│   │   └── useSEO.js             # Automated SEO meta injection
│   │
│   ├── lib/                      # External Client Configurations
│   │   └── axios.js              # Configured Axios instance with auto token refreshing
│   │
│   ├── pages/                    # Route View Pages
│   │   ├── LandingPage.jsx       # Public landing page with hero, perks & stats
│   │   ├── DesignSystemShowcase.jsx # Interactive internal design system preview
│   │   ├── NotFoundPage.jsx      # 404 handler
│   │   └── UnauthorizedPage.jsx  # 403 handler
│   │
│   ├── routes/                   # Router Configuration & Route Guards
│   │   ├── AppRouter.jsx         # Top-level route switch
│   │   └── ProtectedRoute.jsx    # Authentication & RBAC role guards
│   │
│   ├── services/                 # Frontend API Services
│   │   ├── authService.js        # Login, signup, refresh, logout API calls
│   │   ├── internshipService.js  # Search, filter, CRUD API calls
│   │   ├── recruiterService.js   # Recruiter ATS API calls
│   │   └── studentService.js     # Student profile & resume API calls
│   │
│   ├── store/                    # Redux Toolkit Global State
│   │   ├── slices/               # Feature slices (auth, ui, internships)
│   │   └── index.js              # Configured Redux store
│   │
│   ├── utils/                    # Formatting & toast helpers
│   │   └── toast.js              # Hot toast notification helper
│   │
│   ├── App.jsx                   # Root application shell & router provider
│   ├── index.css                 # Tailwind CSS styles & design tokens
│   └── main.jsx                  # React 19 DOM bootstrap
│
├── .env.example                  # Frontend environment variables template
├── eslint.config.js              # ESLint configuration
├── index.html                    # Single Page Application HTML shell
├── package.json                  # Dependencies and script definitions
├── tailwind.config.js            # Custom colors, typography, breakpoints & animations
├── vite.config.js                # Vite build pipeline & reverse proxy
└── README.md                     # Frontend documentation
```

---

## 🚀 Running Frontend Commands

```bash
# Start frontend Vite dev server (port 5173)
npm run dev

# Build production bundle
npm run build

# Preview production build locally
npm run preview

# Run Vitest component and unit test suite
npm run test

# Run ESLint validation
npm run lint

# Run Prettier formatting
npm run format
```
