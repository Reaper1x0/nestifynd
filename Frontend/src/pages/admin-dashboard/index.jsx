import React, { useState, useEffect } from 'react';

import Header from '../../components/ui/Header';
import TabNavigation from '../../components/ui/TabNavigation';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import AdminUsersView from './components/AdminUsersView';
import ReportsView from './components/ReportsView';
import PlansView from './components/PlansView';
import AssignmentsView from './components/AssignmentsView';
import AdminAIView from './components/AdminAIView';
import axiosClient from '../../api/axiosClient';

const AdminDashboard = () => {
  const [activeView, setActiveView] = useState('users');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAssignments: 0,
    totalPlans: 0
  });
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium'
  });

  const loadStats = async () => {
    try {
      const [usersRes, assignmentsRes, plansRes] = await Promise.all([
        axiosClient.get('/api/admin/users'),
        axiosClient.get('/api/admin/assignments'),
        axiosClient.get('/api/plans')
      ]);
      setStats({
        totalUsers: usersRes.data?.length ?? 0,
        totalAssignments: assignmentsRes.data?.length ?? 0,
        totalPlans: plansRes.data?.length ?? 0
      });
    } catch (e) {
      console.error('Failed to load admin stats:', e);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setAccessibilitySettings(prev => ({ ...prev, ...parsed }));
      } catch (e) {}
    }
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const highContrast = window.matchMedia('(prefers-contrast: high)').matches;
    setAccessibilitySettings(prev => ({
      ...prev,
      reducedMotion: prev.reducedMotion || reducedMotion,
      highContrast: prev.highContrast || highContrast
    }));
  }, []);

  const viewOptions = [
    { id: 'users', label: 'Users', icon: 'Users' },
    { id: 'reports', label: 'Reports', icon: 'FileText' },
    { id: 'plans', label: 'Plans', icon: 'CreditCard' },
    { id: 'assignments', label: 'Assignments', icon: 'UserPlus' },
    { id: 'ai', label: 'AI', icon: 'Sparkles' }
  ];

  const renderMainContent = () => {
    switch (activeView) {
      case 'users':
        return <AdminUsersView onUpdate={loadStats} accessibilitySettings={accessibilitySettings} />;
      case 'reports':
        return <ReportsView accessibilitySettings={accessibilitySettings} />;
      case 'plans':
        return <PlansView accessibilitySettings={accessibilitySettings} />;
      case 'assignments':
        return <AssignmentsView onUpdate={loadStats} accessibilitySettings={accessibilitySettings} />;
      case 'ai':
        return <AdminAIView accessibilitySettings={accessibilitySettings} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <TabNavigation />

      <main id="main-content" className="pt-4 pb-20 md:pb-8">
        {/* Dashboard Header */}
        <div className="bg-surface border-b border-border px-4 py-3 md:px-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-text-primary mb-0.5">
                Admin Dashboard
              </h1>
              <p className="text-text-secondary">
                Full system access: users, assignments, plans, and reports
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="text-center p-2.5 bg-surface-secondary rounded-lg">
                <div className="text-xl font-bold text-text-primary">{stats.totalUsers}</div>
                <div className="text-xs text-text-secondary">Total Users</div>
              </div>
              <div className="text-center p-2.5 bg-surface-secondary rounded-lg">
                <div className="text-xl font-bold text-text-primary">{stats.totalAssignments}</div>
                <div className="text-xs text-text-secondary">Assignments</div>
              </div>
              <div className="text-center p-2.5 bg-surface-secondary rounded-lg">
                <div className="text-xl font-bold text-text-primary">{stats.totalPlans}</div>
                <div className="text-xs text-text-secondary">Plans</div>
              </div>
            </div>
          </div>
        </div>

        {/* View Navigation */}
        <div className="bg-surface border-b border-border px-4 md:px-5 py-1.5">
          <div className="flex flex-wrap gap-2">
            {viewOptions.map((view) => (
              <Button
                key={view.id}
                variant={activeView === view.id ? 'primary' : 'outline'}
                iconName={view.icon}
                iconPosition="left"
                onClick={() => setActiveView(view.id)}
                className="text-sm"
              >
                {view.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 md:p-5">{renderMainContent()}</div>
      </main>

      <div
        id="accessibility-announcements"
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />
    </div>
  );
};

export default AdminDashboard;
