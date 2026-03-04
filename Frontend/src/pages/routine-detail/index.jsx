import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import TabNavigation from '../../components/ui/TabNavigation';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import axiosClient from '../../api/axiosClient';

const COMPLETION_CRITERIA = {
  manual: { name: 'Manual Check-off', icon: 'CheckSquare' },
  timer: { name: 'Timer-based', icon: 'Timer' },
  photo: { name: 'Photo Verification', icon: 'Camera' },
  location: { name: 'Location-based', icon: 'MapPin' },
};

const RoutineDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [routine, setRoutine] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);

  const load = async () => {
    if (!id) return;
    try {
      const [rRes, tRes] = await Promise.all([
        axiosClient.get(`/api/routines/${id}`),
        axiosClient.get(`/api/tasks?routine=${id}`).catch(() => ({ data: [] })),
      ]);
      setRoutine(rRes.data);
      setTasks(Array.isArray(tRes.data) ? tRes.data : []);
    } catch (e) {
      setRoutine(null);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleTaskComplete = async (taskId, e) => {
    e?.stopPropagation();
    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.completed || task.isDismissed) return;
    try {
      await axiosClient.patch(`/api/tasks/${taskId}/toggle-complete`);
      setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, completed: !t.completed } : t)));
    } catch (e) { console.error(e); }
  };

  const handleTaskSnooze = async (taskId, e) => {
    e?.stopPropagation();
    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.isSnoozed || task.completed || task.isDismissed) return;
    try {
      await axiosClient.patch(`/api/tasks/${taskId}/snooze`, { minutes: 5 });
      setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, isSnoozed: true } : t)));
    } catch (e) { console.error(e); }
  };

  const handleTaskDismiss = async (taskId, e) => {
    e?.stopPropagation();
    try {
      await axiosClient.patch(`/api/tasks/${taskId}/dismiss`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      if (selectedTask?._id === taskId) setSelectedTask(null);
    } catch (e) { console.error(e); }
  };

  const completedCount = tasks.filter((t) => t.completed && !t.isDismissed).length;
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;
  const allCompleted = tasks.length > 0 && progress === 100;

  const getStatusStyle = (task) => {
    if (task.completed) return 'text-success bg-success-50 border-success-200';
    if (task.isDismissed) return 'text-text-tertiary bg-surface-tertiary border-border-secondary';
    if (task.isSnoozed) return 'text-warning bg-warning-50 border-warning-200';
    return 'text-primary bg-primary-50 border-primary-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <TabNavigation />
        <main className="max-w-3xl mx-auto px-4 py-6">
          <p className="text-text-secondary">Loading routine...</p>
        </main>
      </div>
    );
  }

  if (!routine) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <TabNavigation />
        <main className="max-w-3xl mx-auto px-4 py-6">
          <p className="text-text-secondary mb-4">Routine not found.</p>
          <Button variant="outline" onClick={() => navigate('/routines')}>
            Back to My Routines
          </Button>
        </main>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{routine.title || routine.name} - NestifyND</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        <TabNavigation />

        <main id="main-content" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6" role="main">
          <nav className="flex items-center space-x-2 text-sm text-text-secondary mb-6" aria-label="Breadcrumb">
            <button onClick={() => navigate('/home-dashboard')} className="hover:text-text-primary transition-colors">
              Dashboard
            </button>
            <Icon name="ChevronRight" size={16} />
            <button onClick={() => navigate('/routines')} className="hover:text-text-primary transition-colors">
              My Routines
            </button>
            <Icon name="ChevronRight" size={16} />
            <span className="text-text-primary truncate max-w-[200px]">
              {routine.title || routine.name}
            </span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary flex items-center gap-3">
                {routine.title || routine.name}
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${routine.isActive ? 'text-primary bg-primary-50 border-primary-200' : 'text-text-secondary bg-surface-secondary border-border'}`}>
                  {routine.isActive ? 'Active' : 'Scheduled'}
                </span>
              </h1>
              {routine.description && (
                <p className="text-text-secondary mt-1">{routine.description}</p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                iconName="Edit"
                iconPosition="left"
                onClick={() => navigate(`/routine-builder?edit=${routine._id}`)}
              >
                Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/routines')}>
                Back
              </Button>
            </div>
          </div>

          <div className="bg-surface rounded-xl p-6 border border-border space-y-6">
            <div>
              <div className="flex justify-between text-sm text-text-secondary mb-2">
                <span>Schedule</span>
                {routine.schedule?.startTime && (
                  <span className="flex items-center">
                    <Icon name="Clock" size={14} className="mr-1" />
                    {routine.schedule.startTime}
                    {routine.schedule?.daysOfWeek?.length > 0 && (
                      <span className="ml-2">· {routine.schedule.daysOfWeek.length} days/week</span>
                    )}
                  </span>
                )}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-medium text-text-primary">Tasks</h2>
                <span className="text-sm text-text-secondary">
                  {completedCount} of {tasks.length} completed
                </span>
              </div>
              <div className="w-full bg-surface-tertiary rounded-full h-2 mb-4">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                />
              </div>

              {tasks.length === 0 ? (
                <p className="text-text-secondary text-sm">No tasks in this routine.</p>
              ) : (
                <ul className="space-y-2">
                  {tasks.map((task, index) => {
                    const criteria = COMPLETION_CRITERIA[task.completionCriteria] || COMPLETION_CRITERIA.manual;
                    return (
                      <li
                        key={task._id}
                        onClick={() => setSelectedTask(task)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && setSelectedTask(task)}
                        className={`flex flex-wrap items-center gap-3 p-3 rounded-lg border cursor-pointer hover:ring-2 hover:ring-primary-200 transition-all ${getStatusStyle(task)}`}
                      >
                        <button
                          type="button"
                          onClick={(e) => handleTaskComplete(task._id, e)}
                          className="shrink-0 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                          aria-label={task.completed ? 'Completed' : 'Mark complete'}
                        >
                          <Icon
                            name={task.completed ? 'CheckCircle' : task.isSnoozed ? 'Clock' : 'Circle'}
                            size={18}
                            className={task.completed ? 'text-success' : 'text-text-tertiary'}
                          />
                        </button>
                        <div className="flex-1 min-w-0">
                          <span className={task.completed ? 'line-through' : ''}>
                            {index + 1}. {task.name}
                          </span>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
                              <Icon name={criteria.icon} size={12} />
                              {criteria.name}
                            </span>
                            {task.description && (
                              <span className="text-xs text-text-tertiary truncate max-w-[200px]" title={task.description}>
                                {task.description}
                              </span>
                            )}
                          </div>
                        </div>
                        {!task.completed && !task.isDismissed && (
                          <span className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={(e) => handleTaskSnooze(task._id, e)}
                              disabled={task.isSnoozed}
                              className={`p-1.5 rounded ${task.isSnoozed ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black/10'}`}
                              aria-label={task.isSnoozed ? 'Already snoozed' : 'Snooze'}
                            >
                              <Icon name="Clock" size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleTaskDismiss(task._id, e)}
                              className="p-1.5 rounded hover:bg-black/10"
                              aria-label="Dismiss"
                            >
                              <Icon name="X" size={14} />
                            </button>
                          </span>
                        )}
                        {!task.completed && !task.isDismissed && (
                          <span className="text-xs shrink-0">
                            {task.isSnoozed ? 'Snoozed' : 'Pending'}
                          </span>
                        )}
                        {task.completed && <span className="text-xs shrink-0">Completed</span>}
                      </li>
                    );
                  })}
                </ul>
              )}

              {selectedTask && (
                <div
                  className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                  onClick={() => setSelectedTask(null)}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="task-detail-title"
                >
                  <div
                    className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl border border-gray-200 text-gray-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 id="task-detail-title" className="text-lg font-semibold text-gray-900">
                        {selectedTask.name}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setSelectedTask(null)}
                        className="p-1 rounded hover:bg-black/10"
                        aria-label="Close"
                      >
                        <Icon name="X" size={20} />
                      </button>
                    </div>
                    {selectedTask.description && (
                      <p className="text-gray-600 text-sm mb-3">{selectedTask.description}</p>
                    )}
                    <div className="space-y-2 text-sm text-gray-800">
                      <div className="flex items-center gap-2 text-gray-800">
                        <Icon name={(COMPLETION_CRITERIA[selectedTask.completionCriteria] || COMPLETION_CRITERIA.manual).icon} size={16} className="text-gray-600 shrink-0" />
                        <span>Type: {(COMPLETION_CRITERIA[selectedTask.completionCriteria] || COMPLETION_CRITERIA.manual).name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-800">
                        <Icon name="Clock" size={16} className="text-gray-600 shrink-0" />
                        <span>Scheduled: {selectedTask.scheduledTime || '—'}</span>
                      </div>
                      {selectedTask.estimatedDuration != null && (
                        <div className="flex items-center gap-2 text-gray-800">
                          <Icon name="Timer" size={16} className="text-gray-600 shrink-0" />
                          <span>Estimated: {selectedTask.estimatedDuration} min</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-800">
                        <span>Status:</span>
                        <span className={selectedTask.completed ? 'text-emerald-600 font-medium' : selectedTask.isSnoozed ? 'text-amber-600 font-medium' : 'text-gray-600'}>
                          {selectedTask.completed ? 'Completed' : selectedTask.isSnoozed ? 'Snoozed' : selectedTask.isDismissed ? 'Dismissed' : 'Pending'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-4 border-t border-border flex-wrap">
                      {!selectedTask.completed && !selectedTask.isDismissed && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => { handleTaskComplete(selectedTask._id); setSelectedTask(null); }}
                          >
                            Mark complete
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { handleTaskSnooze(selectedTask._id); setSelectedTask(null); }}
                            disabled={selectedTask.isSnoozed}
                          >
                            Snooze
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => { handleTaskDismiss(selectedTask._id); }}>
                            Dismiss
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => setSelectedTask(null)}>
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {allCompleted && (
              <div className="bg-success-50 border border-success-200 rounded-lg p-4 flex items-center gap-3">
                <Icon name="CheckCircle" size={28} className="text-success shrink-0" />
                <div>
                  <p className="font-medium text-success">All tasks completed!</p>
                  <p className="text-sm text-text-secondary">Great job finishing this routine.</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default RoutineDetail;
