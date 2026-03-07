import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import TabNavigation from '../../components/ui/TabNavigation';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../contexts/AuthContext';

const CaregiverDashboard = () => {
  const { user: authUser } = useAuth();
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [messages, setMessages] = useState([]);
  const [progressData, setProgressData] = useState(null);
  const [routines, setRoutines] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedRoutine, setExpandedRoutine] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [taskEditData, setTaskEditData] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadAssignedUsers();
  }, []);

  const loadAssignedUsers = async () => {
    try {
      const { data } = await axiosClient.get('/api/user-assignments/my-users');
      const users = (Array.isArray(data) ? data : [])
        .filter(a => a.isActive && a.userId)
        .map(a => ({
          id: a.userId._id || a.userId,
          name: a.userId.name || 'Unknown',
          email: a.userId.email || '',
          assignmentId: a._id,
          permissions: a.permissions || {}
        }));
      setAssignedUsers(users);
      if (users.length > 0 && !selectedUser) {
        setSelectedUser(users[0]);
      }
    } catch {
      setAssignedUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      if (selectedUser.permissions?.canViewReports) {
        loadUserActivities(selectedUser.id);
        loadUserProgress(selectedUser.id);
      } else {
        setActivities([]);
        setProgressData(null);
      }
      if (selectedUser.permissions?.canReceiveNotifications) {
        loadMessages(selectedUser.id);
      } else {
        setMessages([]);
      }
      if (selectedUser.permissions?.canOverrideSettings) {
        loadUserRoutines(selectedUser.id);
      } else {
        setRoutines([]);
      }
    }
  }, [selectedUser]);

  const loadUserActivities = async (userId) => {
    try {
      const { data } = await axiosClient.get(`/api/activities/user/${userId}?limit=20`);
      setActivities(Array.isArray(data) ? data : data.activities || []);
    } catch {
      setActivities([]);
    }
  };

  const loadUserProgress = async (userId) => {
    try {
      const { data } = await axiosClient.get(`/api/therapists/clients/reports`);
      const report = (data.reports || []).find(r => 
        (r.clientId?.toString?.() || r.clientId) === userId
      );
      if (report) {
        setProgressData({
          completionRate: report.completionRate || 0,
          currentStreak: report.streak || 0,
          longestStreak: report.longestStreak || 0,
          badgesEarned: report.badgesEarned || 0,
          recentBadges: report.recentBadges || [],
          status: report.status || 'active'
        });
      } else {
        setProgressData(null);
      }
    } catch {
      setProgressData(null);
    }
  };

  const loadMessages = async (contactId) => {
    try {
      const { data } = await axiosClient.get(`/api/messages/messages?contactId=${contactId}`);
      const myId = authUser?.id?.toString?.() || authUser?.id;
      const list = (Array.isArray(data) ? data : []).map(m => {
        const sid = m.senderId?.toString?.() || m.senderId;
        return {
          id: m._id,
          isMe: sid === myId,
          content: m.content,
          timestamp: m.createdAt ? new Date(m.createdAt) : new Date(),
          read: m.read
        };
      });
      setMessages(list);
    } catch {
      setMessages([]);
    }
  };

  const loadUserRoutines = async (userId) => {
    try {
      const { data } = await axiosClient.get(`/api/routines/user/${userId}`);
      setRoutines(Array.isArray(data) ? data : []);
    } catch {
      setRoutines([]);
    }
  };

  const handleActivateRoutine = async (routineId) => {
    if (!selectedUser) return;
    try {
      await axiosClient.patch(`/api/routines/user/${selectedUser.id}/${routineId}/activate`);
      loadUserRoutines(selectedUser.id);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to activate routine');
    }
  };

  const handleToggleRoutineExpand = (routineId) => {
    setExpandedRoutine(expandedRoutine === routineId ? null : routineId);
    setEditingTask(null);
    setTaskEditData({});
  };

  const handleEditTask = (task) => {
    setEditingTask(task._id);
    setTaskEditData({
      name: task.name || '',
      description: task.description || '',
      scheduledTime: task.scheduledTime || '',
      priority: task.priority || 'medium',
      estimatedDuration: task.estimatedDuration || 15
    });
  };

  const handleCancelEditTask = () => {
    setEditingTask(null);
    setTaskEditData({});
  };

  const handleSaveTask = async (taskId) => {
    if (!selectedUser) return;
    try {
      await axiosClient.put(`/api/routines/user/${selectedUser.id}/task/${taskId}`, taskEditData);
      loadUserRoutines(selectedUser.id);
      setEditingTask(null);
      setTaskEditData({});
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update task');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    if (!selectedUser.permissions?.canReceiveNotifications) {
      alert('You do not have permission to send messages to this user');
      return;
    }
    const content = newMessage.trim();
    setNewMessage('');
    try {
      const { data } = await axiosClient.post('/api/messages/send', {
        receiverId: selectedUser.id,
        content
      });
      setMessages(prev => [...prev, {
        id: data._id,
        isMe: true,
        content: data.content || content,
        timestamp: new Date(),
        read: true
      }]);
    } catch {
      setNewMessage(content);
    }
  };

  const formatTime = (ts) => {
    const now = new Date();
    const d = new Date(ts);
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return d.toLocaleDateString();
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'task_completed': return { icon: 'CheckCircle', color: 'text-success' };
      case 'task_snoozed': return { icon: 'Clock', color: 'text-warning' };
      case 'task_dismissed': return { icon: 'XCircle', color: 'text-error' };
      case 'reminder_sent': return { icon: 'Bell', color: 'text-primary' };
      case 'reminder_dismissed': return { icon: 'BellOff', color: 'text-warning' };
      case 'routine_activated': return { icon: 'Play', color: 'text-primary' };
      case 'routine_completed': return { icon: 'Award', color: 'text-success' };
      case 'badge_earned': return { icon: 'Award', color: 'text-warning' };
      default: return { icon: 'Activity', color: 'text-text-secondary' };
    }
  };

  const getInitials = (name) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-success bg-success-50';
      case 'active': return 'text-primary bg-primary-50';
      case 'needs-attention': return 'text-warning bg-warning-50';
      default: return 'text-text-secondary bg-surface-secondary';
    }
  };

  const getAvailableTabs = () => {
    const tabs = [];
    if (selectedUser?.permissions?.canViewReports) {
      tabs.push({ id: 'overview', label: 'Activity Feed', icon: 'Activity' });
      tabs.push({ id: 'progress', label: 'View Progress', icon: 'TrendingUp' });
    }
    if (selectedUser?.permissions?.canReceiveNotifications) {
      tabs.push({ id: 'messages', label: 'Messages', icon: 'MessageCircle' });
    }
    if (selectedUser?.permissions?.canOverrideSettings) {
      tabs.push({ id: 'routines', label: 'Routines', icon: 'Calendar' });
    }
    return tabs;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const availableTabs = getAvailableTabs();

  return (
    <div className="min-h-screen bg-background">
      <Helmet><title>Caregiver Dashboard - NestifyND</title></Helmet>
      <Header />
      <TabNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Caregiver Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">
            Monitor and support your assigned users
          </p>
        </div>

        {assignedUsers.length === 0 ? (
          <div className="bg-surface border border-border rounded-lg p-12 text-center">
            <Icon name="Users" size={48} className="mx-auto mb-4 text-text-tertiary" />
            <h3 className="text-lg font-medium text-text-primary mb-2">No Assigned Users</h3>
            <p className="text-sm text-text-secondary">
              Users can assign you as their caregiver from their Settings page.
              Share your email address with them to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* User List Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-surface border border-border rounded-lg overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h2 className="text-sm font-semibold text-text-primary">
                    Assigned Users ({assignedUsers.length})
                  </h2>
                </div>
                <div className="divide-y divide-border">
                  {assignedUsers.map(user => (
                    <button
                      key={user.id}
                      onClick={() => {
                        setSelectedUser(user);
                        const tabs = [];
                        if (user.permissions?.canViewReports) tabs.push('overview');
                        else if (user.permissions?.canReceiveNotifications) tabs.push('messages');
                        if (tabs.length > 0) setActiveTab(tabs[0]);
                      }}
                      className={`w-full flex items-center space-x-3 p-4 text-left transition-colors hover:bg-surface-secondary ${
                        selectedUser?.id === user.id ? 'bg-primary-50 border-l-4 border-l-primary' : ''
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-semibold text-sm">{getInitials(user.name)}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-text-primary truncate">{user.name}</div>
                        <div className="text-xs text-text-secondary truncate">{user.email}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {selectedUser && (
                <>
                  {/* User Info Card */}
                  <div className="bg-surface border border-border rounded-lg p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary font-bold text-xl">{getInitials(selectedUser.name)}</span>
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-text-primary">{selectedUser.name}</h2>
                        <p className="text-sm text-text-secondary">{selectedUser.email}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {selectedUser.permissions?.canViewReports && (
                            <span className="inline-flex items-center text-xs text-success bg-success-50 px-2 py-1 rounded">
                              <Icon name="Eye" size={12} className="mr-1" /> View Progress
                            </span>
                          )}
                          {selectedUser.permissions?.canReceiveNotifications && (
                            <span className="inline-flex items-center text-xs text-primary bg-primary-50 px-2 py-1 rounded">
                              <Icon name="MessageCircle" size={12} className="mr-1" /> Send Messages
                            </span>
                          )}
                          {selectedUser.permissions?.canOverrideSettings && (
                            <span className="inline-flex items-center text-xs text-warning bg-warning-50 px-2 py-1 rounded">
                              <Icon name="Settings" size={12} className="mr-1" /> Modify Routines
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {availableTabs.length === 0 ? (
                    <div className="bg-surface border border-border rounded-lg p-12 text-center">
                      <Icon name="Lock" size={48} className="mx-auto mb-4 text-text-tertiary" />
                      <h3 className="text-lg font-medium text-text-primary mb-2">Limited Access</h3>
                      <p className="text-sm text-text-secondary">
                        You don't have any permissions for this user yet.
                        The user can grant you permissions from their Settings page.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Tab Navigation */}
                      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
                        {availableTabs.map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              activeTab === tab.id
                                ? 'bg-primary text-primary-foreground'
                                : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                            }`}
                          >
                            <Icon name={tab.icon} size={16} />
                            <span>{tab.label}</span>
                          </button>
                        ))}
                      </div>

                      {/* Tab Content */}
                      {activeTab === 'overview' && selectedUser.permissions?.canViewReports && (
                        <div className="bg-surface border border-border rounded-lg">
                          <div className="p-4 border-b border-border">
                            <h3 className="text-sm font-semibold text-text-primary">Recent Activity</h3>
                            <p className="text-xs text-text-secondary mt-1">
                              Notifications about {selectedUser.name}'s routines and tasks
                            </p>
                          </div>
                          <div className="divide-y divide-border max-h-96 overflow-y-auto">
                            {activities.length === 0 ? (
                              <div className="p-8 text-center">
                                <Icon name="Activity" size={32} className="mx-auto mb-2 text-text-tertiary" />
                                <p className="text-sm text-text-secondary">No recent activity</p>
                              </div>
                            ) : (
                              activities.map((activity, idx) => {
                                const { icon, color } = getActivityIcon(activity.type);
                                return (
                                  <div key={activity._id || idx} className="flex items-start space-x-3 p-4">
                                    <div className={`flex-shrink-0 ${color}`}>
                                      <Icon name={icon} size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-text-primary">{activity.description || activity.title || activity.action}</p>
                                      <p className="text-xs text-text-secondary mt-1">{formatTime(activity.createdAt)}</p>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}

                      {activeTab === 'progress' && selectedUser.permissions?.canViewReports && (
                        <div className="space-y-6">
                          {progressData ? (
                            <>
                              {/* Progress Stats */}
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-surface border border-border rounded-lg p-4 text-center">
                                  <div className="text-3xl font-bold text-primary">{progressData.completionRate}%</div>
                                  <div className="text-xs text-text-secondary mt-1">Completion Rate</div>
                                </div>
                                <div className="bg-surface border border-border rounded-lg p-4 text-center">
                                  <div className="text-3xl font-bold text-warning">{progressData.currentStreak}</div>
                                  <div className="text-xs text-text-secondary mt-1">Current Streak</div>
                                </div>
                                <div className="bg-surface border border-border rounded-lg p-4 text-center">
                                  <div className="text-3xl font-bold text-success">{progressData.longestStreak}</div>
                                  <div className="text-xs text-text-secondary mt-1">Longest Streak</div>
                                </div>
                                <div className="bg-surface border border-border rounded-lg p-4 text-center">
                                  <div className="text-3xl font-bold text-text-primary">{progressData.badgesEarned}</div>
                                  <div className="text-xs text-text-secondary mt-1">Badges Earned</div>
                                </div>
                              </div>

                              {/* Status */}
                              <div className="bg-surface border border-border rounded-lg p-6">
                                <h3 className="text-sm font-semibold text-text-primary mb-4">Overall Status</h3>
                                <div className="flex items-center space-x-3">
                                  <span className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${getStatusColor(progressData.status)}`}>
                                    {progressData.status === 'needs-attention' ? 'Needs Attention' : progressData.status}
                                  </span>
                                  <p className="text-sm text-text-secondary">
                                    {progressData.status === 'excellent' && 'Great progress! Keep it up!'}
                                    {progressData.status === 'active' && 'Making steady progress.'}
                                    {progressData.status === 'needs-attention' && 'May need some support.'}
                                  </p>
                                </div>
                              </div>

                              {/* Recent Badges */}
                              {progressData.recentBadges?.length > 0 && (
                                <div className="bg-surface border border-border rounded-lg p-6">
                                  <h3 className="text-sm font-semibold text-text-primary mb-4">Recent Badges</h3>
                                  <div className="flex flex-wrap gap-3">
                                    {progressData.recentBadges.map((badge, idx) => (
                                      <span key={idx} className="inline-flex items-center px-3 py-2 bg-warning-50 text-warning rounded-lg text-sm">
                                        <Icon name="Award" size={16} className="mr-2" />
                                        {badge}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="bg-surface border border-border rounded-lg p-12 text-center">
                              <Icon name="TrendingUp" size={48} className="mx-auto mb-4 text-text-tertiary" />
                              <h3 className="text-lg font-medium text-text-primary mb-2">No Progress Data</h3>
                              <p className="text-sm text-text-secondary">
                                Progress data will appear once the user starts completing tasks.
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === 'messages' && selectedUser.permissions?.canReceiveNotifications && (
                        <div className="bg-surface border border-border rounded-lg flex flex-col" style={{ height: '400px' }}>
                          <div className="p-4 border-b border-border">
                            <h3 className="text-sm font-semibold text-text-primary">Messages with {selectedUser.name}</h3>
                          </div>
                          <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {messages.length === 0 ? (
                              <div className="flex flex-col items-center justify-center h-full text-center">
                                <Icon name="MessageCircle" size={32} className="text-text-tertiary mb-2" />
                                <p className="text-sm text-text-secondary">No messages yet</p>
                              </div>
                            ) : (
                              messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-xs px-4 py-2 rounded-lg ${
                                    msg.isMe ? 'bg-primary text-primary-foreground' : 'bg-surface-secondary text-text-primary'
                                  }`}>
                                    <p className="text-sm">{msg.content}</p>
                                    <p className={`text-xs mt-1 ${msg.isMe ? 'text-primary-foreground opacity-70' : 'text-text-tertiary'}`}>
                                      {formatTime(msg.timestamp)}
                                    </p>
                                  </div>
                                </div>
                              ))
                            )}
                            <div ref={messagesEndRef} />
                          </div>
                          <div className="p-4 border-t border-border">
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Type a message..."
                                className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary text-sm"
                              />
                              <Button
                                variant="primary"
                                iconName="Send"
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim()}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'routines' && selectedUser.permissions?.canOverrideSettings && (
                        <div className="space-y-4">
                          <div className="bg-surface border border-border rounded-lg">
                            <div className="p-4 border-b border-border">
                              <h3 className="text-sm font-semibold text-text-primary">{selectedUser.name}'s Routines</h3>
                              <p className="text-xs text-text-secondary mt-1">
                                Click on a routine to view tasks and make modifications
                              </p>
                            </div>
                            <div className="divide-y divide-border">
                              {routines.length === 0 ? (
                                <div className="p-8 text-center">
                                  <Icon name="Calendar" size={32} className="mx-auto mb-2 text-text-tertiary" />
                                  <p className="text-sm text-text-secondary">No routines found</p>
                                  <p className="text-xs text-text-tertiary mt-1">
                                    This user hasn't created any routines yet.
                                  </p>
                                </div>
                              ) : (
                                routines.map(routine => (
                                  <div key={routine._id} className="overflow-hidden">
                                    {/* Routine Header - Clickable */}
                                    <button
                                      onClick={() => handleToggleRoutineExpand(routine._id)}
                                      className="w-full p-4 text-left hover:bg-surface-secondary transition-colors"
                                    >
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center space-x-2">
                                            <Icon 
                                              name={expandedRoutine === routine._id ? 'ChevronDown' : 'ChevronRight'} 
                                              size={16} 
                                              className="text-text-tertiary flex-shrink-0" 
                                            />
                                            <h4 className="text-sm font-medium text-text-primary">{routine.title}</h4>
                                            {routine.isActive && (
                                              <span className="px-2 py-0.5 text-xs bg-success-50 text-success rounded-full">
                                                Active
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-xs text-text-secondary mt-1 ml-6">{routine.description}</p>
                                          <div className="flex items-center space-x-4 mt-2 ml-6 text-xs text-text-tertiary">
                                            <span className="flex items-center">
                                              <Icon name="Clock" size={12} className="mr-1" />
                                              {routine.schedule?.startTime || 'No time set'}
                                            </span>
                                            <span className="flex items-center">
                                              <Icon name="List" size={12} className="mr-1" />
                                              {routine.tasks?.length || 0} tasks
                                            </span>
                                            {routine.schedule?.daysOfWeek?.length > 0 && (
                                              <span className="flex items-center">
                                                <Icon name="Calendar" size={12} className="mr-1" />
                                                {routine.schedule.daysOfWeek.map(d => d.slice(0, 3)).join(', ')}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                          {!routine.isActive && (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => handleActivateRoutine(routine._id)}
                                              iconName="Play"
                                              iconPosition="left"
                                            >
                                              Activate
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    </button>
                                    
                                    {/* Expanded Tasks List */}
                                    {expandedRoutine === routine._id && (
                                      <div className="bg-surface-secondary border-t border-border">
                                        <div className="p-4">
                                          <div className="flex items-center justify-between mb-3">
                                            <p className="text-xs font-semibold text-text-primary uppercase tracking-wide">
                                              Tasks ({routine.tasks?.length || 0})
                                            </p>
                                          </div>
                                          
                                          {(!routine.tasks || routine.tasks.length === 0) ? (
                                            <div className="text-center py-6">
                                              <Icon name="ListTodo" size={24} className="mx-auto mb-2 text-text-tertiary" />
                                              <p className="text-xs text-text-secondary">No tasks in this routine</p>
                                            </div>
                                          ) : (
                                            <div className="space-y-3">
                                              {routine.tasks.map((task, idx) => (
                                                <div 
                                                  key={task._id || idx} 
                                                  className="bg-surface border border-border rounded-lg p-3"
                                                >
                                                  {editingTask === task._id ? (
                                                    // Edit Mode
                                                    <div className="space-y-3">
                                                      <div>
                                                        <label className="text-xs font-medium text-text-secondary block mb-1">Task Name</label>
                                                        <input
                                                          type="text"
                                                          value={taskEditData.name}
                                                          onChange={(e) => setTaskEditData(prev => ({ ...prev, name: e.target.value }))}
                                                          className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                                        />
                                                      </div>
                                                      <div>
                                                        <label className="text-xs font-medium text-text-secondary block mb-1">Description</label>
                                                        <textarea
                                                          value={taskEditData.description}
                                                          onChange={(e) => setTaskEditData(prev => ({ ...prev, description: e.target.value }))}
                                                          rows={2}
                                                          className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                                        />
                                                      </div>
                                                      <div className="grid grid-cols-3 gap-3">
                                                        <div>
                                                          <label className="text-xs font-medium text-text-secondary block mb-1">Time</label>
                                                          <input
                                                            type="time"
                                                            value={taskEditData.scheduledTime}
                                                            onChange={(e) => setTaskEditData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                                                            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                                          />
                                                        </div>
                                                        <div>
                                                          <label className="text-xs font-medium text-text-secondary block mb-1">Priority</label>
                                                          <select
                                                            value={taskEditData.priority}
                                                            onChange={(e) => setTaskEditData(prev => ({ ...prev, priority: e.target.value }))}
                                                            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                                          >
                                                            <option value="low">Low</option>
                                                            <option value="medium">Medium</option>
                                                            <option value="high">High</option>
                                                          </select>
                                                        </div>
                                                        <div>
                                                          <label className="text-xs font-medium text-text-secondary block mb-1">Duration (min)</label>
                                                          <input
                                                            type="number"
                                                            value={taskEditData.estimatedDuration}
                                                            onChange={(e) => setTaskEditData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 15 }))}
                                                            min={1}
                                                            max={240}
                                                            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                                          />
                                                        </div>
                                                      </div>
                                                      <div className="flex items-center justify-end space-x-2 pt-2">
                                                        <Button
                                                          variant="ghost"
                                                          size="sm"
                                                          onClick={handleCancelEditTask}
                                                        >
                                                          Cancel
                                                        </Button>
                                                        <Button
                                                          variant="primary"
                                                          size="sm"
                                                          onClick={() => handleSaveTask(task._id)}
                                                          iconName="Check"
                                                          iconPosition="left"
                                                        >
                                                          Save
                                                        </Button>
                                                      </div>
                                                    </div>
                                                  ) : (
                                                    // View Mode
                                                    <div className="flex items-start justify-between">
                                                      <div className="flex items-start space-x-3 flex-1">
                                                        <div className={`mt-0.5 ${task.completed ? 'text-success' : task.isSnoozed ? 'text-warning' : 'text-text-tertiary'}`}>
                                                          <Icon 
                                                            name={task.completed ? 'CheckCircle' : task.isSnoozed ? 'Clock' : 'Circle'} 
                                                            size={18} 
                                                          />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                          <div className="flex items-center space-x-2">
                                                            <span className={`text-sm font-medium ${task.completed ? 'text-text-tertiary line-through' : 'text-text-primary'}`}>
                                                              {task.name}
                                                            </span>
                                                            <span className={`px-1.5 py-0.5 text-xs rounded ${
                                                              task.priority === 'high' ? 'bg-error-50 text-error' :
                                                              task.priority === 'medium' ? 'bg-warning-50 text-warning' :
                                                              'bg-surface-secondary text-text-tertiary'
                                                            }`}>
                                                              {task.priority}
                                                            </span>
                                                          </div>
                                                          {task.description && (
                                                            <p className="text-xs text-text-secondary mt-1">{task.description}</p>
                                                          )}
                                                          <div className="flex items-center space-x-3 mt-2 text-xs text-text-tertiary">
                                                            <span className="flex items-center">
                                                              <Icon name="Clock" size={12} className="mr-1" />
                                                              {task.scheduledTime || 'No time'}
                                                            </span>
                                                            <span className="flex items-center">
                                                              <Icon name="Timer" size={12} className="mr-1" />
                                                              {task.estimatedDuration || 15} min
                                                            </span>
                                                            {task.isSnoozed && (
                                                              <span className="flex items-center text-warning">
                                                                <Icon name="Clock" size={12} className="mr-1" />
                                                                Snoozed
                                                              </span>
                                                            )}
                                                          </div>
                                                        </div>
                                                      </div>
                                                      <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditTask(task)}
                                                        iconName="Edit2"
                                                        className="flex-shrink-0"
                                                      />
                                                    </div>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CaregiverDashboard;
