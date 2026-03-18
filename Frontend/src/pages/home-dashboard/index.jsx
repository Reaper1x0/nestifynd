import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import TabNavigation from '../../components/ui/TabNavigation';
import WelcomeHeader from './components/WelcomeHeader';
import TodaysRoutines from './components/TodaysRoutines';
import QuickStats from './components/QuickStats';
import RecentActivity from './components/RecentActivity';
import QuickActions from './components/QuickActions';
import { useAuth } from '../../contexts/AuthContext';

const HomeDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const redirectMessage = location.state?.message;
  useEffect(() => {
    // Set focus to main content for accessibility
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>Dashboard - NestifyND</title>
        <meta name="description" content="Your personal dashboard for managing daily routines, tracking progress, and staying organized with NestifyND." />
        <meta name="keywords" content="dashboard, routines, neurodivergent, accessibility, task management" />
        <meta property="og:title" content="Dashboard - NestifyND" />
        <meta property="og:description" content="Manage your daily routines and track your progress with our accessible dashboard." />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        <TabNavigation />
        
        <main 
          id="main-content"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
          role="main"
          tabIndex="-1"
        >
          {redirectMessage && (
            <div
              role="alert"
              className="mb-4 p-4 rounded-lg bg-primary-50 border border-primary-200 text-primary-800 flex items-center justify-between gap-3"
            >
              <span className="text-sm">{redirectMessage}</span>
              <button
                onClick={() => navigate('.', { replace: true, state: {} })}
                className="text-primary-600 hover:text-primary-800 font-medium text-sm shrink-0"
                aria-label="Dismiss"
              >
                Dismiss
              </button>
            </div>
          )}
          {/* Welcome Section */}
          <WelcomeHeader userName={user?.name || user?.email} />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <TodaysRoutines />
              <QuickStats />
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <RecentActivity />
              <QuickActions />
            </div>
          </div>

          {/* Mobile-only bottom spacing for tab navigation */}
          <div className="md:hidden h-6" aria-hidden="true" />
        </main>

        {/* Accessibility announcements */}
        <div 
          id="dashboard-announcements"
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        />
      </div>
    </>
  );
};

export default HomeDashboard;