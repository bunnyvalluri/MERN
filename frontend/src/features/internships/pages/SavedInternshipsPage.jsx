import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchSavedInternships, toggleSaveInternship } from '../internshipSlice.js';
import Navbar from '../../../components/common/Navbar.jsx';
import Footer from '../../../components/common/Footer.jsx';
import SEOHead from '../../../components/common/SEOHead.jsx';
import InternshipCard from '../components/InternshipCard.jsx';
import { EmptyState, Button } from '../../../components/ui/index.js';
import { Bookmark, ArrowLeft, Briefcase, Search } from 'lucide-react';
import { notify } from '../../../utils/toast.js';

export function SavedInternshipsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { savedInternships, loading } = useSelector((state) => state.internships);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      notify.info('Please log in to view your saved internships.');
      navigate('/login');
      return;
    }
    dispatch(fetchSavedInternships());
  }, [dispatch, isAuthenticated, navigate]);

  const handleToggleSave = async (id) => {
    await dispatch(toggleSaveInternship(id));
    dispatch(fetchSavedInternships());
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <SEOHead
        title="Saved Internships & Bookmarks — InternHub"
        description="View and manage your saved tech internships and bookmarked opportunities."
      />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                to="/internships"
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Discovery
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Bookmark className="w-7 h-7 text-brand-600 fill-brand-100" />
              <span>Saved Internships</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {savedInternships.length} opportunity{savedInternships.length === 1 ? '' : 'ies'} bookmarked for review
            </p>
          </div>

          <Link to="/internships">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Search className="w-4 h-4" />}
            >
              Explore More Roles
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="p-6 bg-white rounded-3xl border border-slate-200 space-y-4 animate-pulse">
                <div className="w-12 h-12 rounded-2xl bg-slate-200" />
                <div className="w-3/4 h-5 bg-slate-200 rounded" />
                <div className="w-full h-12 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && savedInternships.length === 0 && (
          <EmptyState
            title="You haven't saved any internships yet"
            description="Bookmark opportunities while browsing the discovery feed to review and apply to them later."
            actionLabel="Discover Internships"
            onAction={() => navigate('/internships')}
          />
        )}

        {/* Listings Grid */}
        {!loading && savedInternships.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedInternships.map((internship) => (
              <InternshipCard
                key={internship._id || internship.id || internship.slug}
                internship={internship}
                isSaved={true}
                layout="grid"
                onToggleSave={() => handleToggleSave(internship._id || internship.id)}
                onViewDetails={() => navigate(`/internships/${internship.slug || internship._id || internship.id}`)}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default SavedInternshipsPage;
