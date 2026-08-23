/**
 * CompaniesPage — Public discovery page for companies hiring on InternHub.
 *
 * This is a placeholder shell with full SEO metadata in place.
 * The live company listings feature is a future milestone.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/common/Navbar.jsx';
import Footer from '../../../components/common/Footer.jsx';
import SEOHead from '../../../components/common/SEOHead.jsx';
import { Button, Badge } from '../../../components/ui/index.js';
import { Building2, ArrowRight, Briefcase, ShieldCheck, Users } from 'lucide-react';

const COMPANIES_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Top Tech Companies Hiring Interns | InternHub',
  description:
    'Browse 500+ verified tech companies actively hiring undergraduate and graduate interns. From early-stage startups to Fortune 500 engineering teams.',
  url: 'https://internhub.dev/companies',
  isPartOf: {
    '@type': 'WebSite',
    name: 'InternHub',
    url: 'https://internhub.dev/',
  },
};

export function CompaniesPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-brand-500/20 selection:text-brand-700">
      <SEOHead
        title="Top Tech Companies Hiring Interns | InternHub"
        description="Browse 500+ verified tech companies actively hiring undergraduate and graduate interns. From early-stage startups to Fortune 500 engineering teams on InternHub."
        canonicalPath="/companies"
        ogType="website"
        jsonLd={COMPANIES_JSON_LD}
      />

      <Navbar />

      <main id="main-content" className="flex-1" aria-label="Company directory">
        {/* ── Page Header ───────────────────────────────────────────────── */}
        <section
          aria-labelledby="companies-page-heading"
          className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-brand-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <Badge variant="primary" size="sm">
              Company Directory
            </Badge>

            <h1
              id="companies-page-heading"
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight"
            >
              Find the right{' '}
              <span className="text-gradient">company</span> for your internship.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Explore 500+ verified companies actively building their next generation of engineers.
              Filter by industry, company size, and tech stack.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-4 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-600" />
                <span><strong className="text-slate-900">500+</strong> Verified Companies</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span><strong className="text-slate-900">100%</strong> Identity Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" />
                <span><strong className="text-slate-900">10,000+</strong> Active Students</span>
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/internships">
                <Button
                  variant="primary"
                  size="lg"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                  className="px-8"
                >
                  Browse All Internships
                </Button>
              </Link>
              <Link to="/internships?sortBy=popularity">
                <Button variant="secondary" size="lg" className="px-6">
                  Explore Top Opportunities
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Coming Soon Notice ────────────────────────────────────────── */}
        <section
          aria-label="Company directory coming soon"
          className="py-16 sm:py-24 border-t border-slate-200 bg-white"
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center mx-auto">
              <Briefcase className="w-8 h-8 text-brand-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Full company profiles coming soon
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              We're building detailed company pages with culture insights, engineering team
              breakdowns, campus hiring history, and benefit overviews. In the meantime,
              explore all open internships directly.
            </p>
            <Link to="/internships">
              <Button
                variant="outline"
                size="md"
                leftIcon={<Briefcase className="w-4 h-4" />}
              >
                View All Internships
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default CompaniesPage;
