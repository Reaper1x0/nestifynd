import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import TabNavigation from '../../components/ui/TabNavigation';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import axiosClient from '../../api/axiosClient';

const RoutinesList = () => {
  const navigate = useNavigate();
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient.get('/api/routines')
      .then((res) => setRoutines(Array.isArray(res.data) ? res.data : []))
      .catch(() => setRoutines([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSetActive = async (routineId) => {
    try {
      await axiosClient.patch(`/api/routines/${routineId}/set-active`);
      setRoutines((prev) =>
        prev.map((r) => ({ ...r, isActive: r._id === routineId }))
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <Helmet>
        <title>My Routines - NestifyND</title>
        <meta name="description" content="View and manage all your routines." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        <TabNavigation />

        <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" role="main">
          <nav className="flex items-center space-x-2 text-sm text-text-secondary mb-6" aria-label="Breadcrumb">
            <button onClick={() => navigate('/home-dashboard')} className="hover:text-text-primary transition-colors">
              Dashboard
            </button>
            <Icon name="ChevronRight" size={16} />
            <span className="text-text-primary">My Routines</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h1 className="text-2xl font-semibold text-text-primary flex items-center">
              <Icon name="Calendar" size={28} className="mr-2 text-primary" />
              My Routines
            </h1>
            <Button
              variant="primary"
              iconName="Plus"
              iconPosition="left"
              onClick={() => navigate('/routine-builder')}
            >
              Create New Routine
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <span className="text-text-secondary">Loading routines...</span>
            </div>
          ) : routines.length === 0 ? (
            <div className="bg-surface rounded-xl p-8 text-center border border-border">
              <Icon name="Calendar" size={48} className="mx-auto text-text-tertiary mb-4" />
              <p className="text-text-secondary mb-4">You don&apos;t have any routines yet.</p>
              <Button variant="primary" iconName="Plus" iconPosition="left" onClick={() => navigate('/routine-builder')}>
                Create Your First Routine
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {routines.map((routine) => (
                <div
                  key={routine._id}
                  className="bg-surface rounded-xl p-4 border border-border hover:border-primary-200 transition-colors flex flex-col"
                >
                  <button
                    type="button"
                    onClick={() => navigate(`/routines/${routine._id}`)}
                    className="text-left"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h2 className="text-lg font-medium text-text-primary pr-2 hover:text-primary transition-colors">
                        {routine.title || routine.name}
                      </h2>
                    <span className={`shrink-0 px-2 py-1 rounded-full text-xs font-medium border ${routine.isActive ? 'text-primary bg-primary-50 border-primary-200' : 'text-text-secondary bg-surface-secondary border-border'}`}>
                      {routine.isActive ? 'Active' : 'Scheduled'}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary mb-3 line-clamp-2 flex-1">
                    {routine.description || 'No description'}
                  </p>
                  <div className="flex items-center text-sm text-text-tertiary mb-4">
                    <Icon name="Clock" size={14} className="mr-1" />
                    {routine.schedule?.startTime || '--:--'}
                    {routine.schedule?.daysOfWeek?.length > 0 && (
                      <span className="ml-2">· {routine.schedule.daysOfWeek.length} days</span>
                    )}
                  </div>
                  </button>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/routines/${routine._id}`)}
                      iconName="Eye"
                      iconPosition="left"
                    >
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/routine-builder?edit=${routine._id}`)}
                      iconName="Edit"
                      iconPosition="left"
                    >
                      Edit
                    </Button>
                    {!routine.isActive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetActive(routine._id)}
                        iconName="Play"
                        iconPosition="left"
                      >
                        Set active
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default RoutinesList;
