import React, { useState } from 'react';
import { Button, Input, Badge } from '../ui/index.js';
import { notify } from '../../utils/toast.js';
import {
  Sparkles,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Heart,
  Globe,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

/**
 * Production-ready multi-column SaaS Footer.
 */
export function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      notify.error('Please provide a valid university or personal email.');
      return;
    }
    notify.success('Subscribed to InternHub weekly job dispatch!');
    setEmail('');
  };

  const footerLinks = {
    Product: [
      { label: 'Discover Internships', href: '#featured' },
      { label: 'Application Tracker', href: '#how-it-works' },
      { label: 'Company Directory', href: '#companies' },
      { label: 'Design System', href: '/design-system' },
    ],
    Recruiters: [
      { label: 'Post an Internship', href: '#companies' },
      { label: 'Candidate Pipeline', href: '#companies' },
      { label: 'University Partnerships', href: '#companies' },
      { label: 'Pricing Plans', href: '#companies' },
    ],
    Resources: [
      { label: 'Resume Guide for Tech', href: '#resources' },
      { label: 'Coding Interview Prep', href: '#resources' },
      { label: 'Salary & Stipend Index', href: '#resources' },
      { label: 'Career Blog', href: '#resources' },
    ],
    Legal: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Security & Compliance', href: '#' },
      { label: 'Student Data Safety', href: '#' },
    ],
  };

  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 text-xs sm:text-sm">
      {/* Top Newsletter & Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-b border-slate-100">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 space-y-2">
            <Badge variant="primary" size="sm" className="mb-2">
              Weekly Internship Dispatch
            </Badge>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Get top internships delivered to your inbox
            </h3>
            <p className="text-slate-600 text-sm max-w-md">
              Zero spam. Only hand-curated engineering, product, and design roles from verified
              companies.
            </p>
          </div>

          <div className="lg:col-span-6">
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                className="w-full"
                required
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="shrink-0"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Links Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="sm:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base tracking-tight text-slate-900">InternHub</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm leading-relaxed">
              InternHub is the next-generation internship discovery, tracking, and recruiter management
              platform built for students and high-growth tech engineering teams.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <Badge variant="success" size="sm" dot pulse>
                All Systems Operational
              </Badge>
            </div>
          </div>

          {/* Links Groups */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group} className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                {group}
              </h4>
              <ul className="space-y-2 text-xs">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar & Copyright */}
      <div className="border-t border-slate-100 bg-slate-50/80 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} InternHub Platform, Inc. All rights reserved.
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4 text-slate-500">
            <a
              href="https://github.com/bunnyvalluri/MERN"
              target="_blank"
              rel="noreferrer"
              aria-label="InternHub GitHub Repository"
              className="hover:text-slate-900 transition-colors p-1"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              aria-label="InternHub Twitter"
              className="hover:text-slate-900 transition-colors p-1"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              aria-label="InternHub LinkedIn"
              className="hover:text-slate-900 transition-colors p-1"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
