/**
 * CompanyDetailPage — Public company profile page.
 *
 * Placeholder shell with full SEO metadata per company.
 * Uses URL :id param to build canonical and JSON-LD.
 * The full company detail feature is a future milestone.
 */
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../../../components/common/Navbar.jsx';
import Footer from '../../../components/common/Footer.jsx';
import SEOHead from '../../../components/common/SEOHead.jsx';
import { Button } from '../../../components/ui/index.js';
import { Building2, ArrowLeft, ArrowRight, Briefcase } from 'lucide-react';

export function CompanyDetailPage() {
  const { id } = useParams();

  /**
   * In production this would fetch company data from Redux / API.
   * Using id as placeholder until the feature is built.
   */
  const companyName = `Company ${id}`;
  const pageTitle = `${companyName} Internships & Hiring | InternHub`;
  const pageDescription = `View internship opportunities, engineering culture, and tech stack at ${companyName}. Apply directly through InternHub with your verified student profile.`;

  const companyJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: pageTitle,
    description: pageDescription,
    url: `https://internhub.dev/companies/${id}`,
    mainEntity: {
      '@type': 'Organization',
      name: companyName,
      url: `https://internhub.dev/companies/${id}`,
    },
    isPartOf: {
      '@type': 'WebSite',
      name: 'InternHub',
      url: 'https://internhub.dev/',
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-brand-500/20 selection:text-brand-700">
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonicalPath={`/companies/${id}`}
        ogType="website"
        jsonLd={companyJsonLd}
      />

      <Navbar />

      <main
        id="main-content"
        className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
        aria-label={`${companyName} company profile`}
      >
        {/* Back navigation */}
        <div>
          <Link
            to="/companies"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
            aria-label="Back to all companies"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to all companies
          </Link>
        </div>

        {/* Company header */}
        <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto">
            <Building2 className="w-10 h-10 text-brand-600" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {companyName}
          </h1>

          <p className="text-slate-600 text-sm max-w-xl mx-auto">
            Full company profiles with culture insights, hiring history, and engineering team breakdowns
            are coming soon.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to={`/internships?company=${id}`}>
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                View Open Internships
              </Button>
            </Link>
            <Link to="/companies">
              <Button variant="outline" size="md" leftIcon={<Building2 className="w-4 h-4" />}>
                All Companies
              </Button>
            </Link>
          </div>
        </div>

        {/* Redirect to internships section */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 flex items-start gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center shrink-0">
            <Briefcase className="w-5 h-5 text-brand-600" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900">
              Explore open roles at {companyName}
            </p>
            <p className="text-xs text-slate-600">
              While full company profiles are being built, you can browse all internships and filter
              by company name in the search bar.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default CompanyDetailPage;
