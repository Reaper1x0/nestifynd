import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axiosClient from '../../../api/axiosClient';

const QuickStats = () => {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosClient.get('/api/dashboard/stats');
        setStatsData(res.data);
      } catch (e) {
        setStatsData(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const streak = statsData?.streak?.currentStreak ?? 0;
  const longestStreak = statsData?.streak?.longestStreak ?? 0;
  const totalBadges = statsData?.totalBadges ?? 0;
  const totalRoutines = statsData?.totalRoutines ?? 0;
  const activeRoutines = statsData?.activeRoutinesCount ?? 0;
  const weeklyCompletion = statsData?.weeklyCompletion ?? 0;
  const weeklyChange = statsData?.weeklyCompletionChange ?? '0%';
  const weeklyChartData = statsData?.weeklyChartData ?? [
    { day: 'Mon', completed: 0, total: 1 },
    { day: 'Tue', completed: 0, total: 1 },
    { day: 'Wed', completed: 0, total: 1 },
    { day: 'Thu', completed: 0, total: 1 },
    { day: 'Fri', completed: 0, total: 1 },
    { day: 'Sat', completed: 0, total: 1 },
    { day: 'Sun', completed: 0, total: 1 }
  ];
  const completedPct = statsData?.overallCompletion?.completed ?? 0;
  const pendingPct = statsData?.overallCompletion?.pending ?? 100;
  const completionData = [
    { name: 'Completed', value: completedPct, color: '#10B981' },
    { name: 'Pending', value: pendingPct, color: '#E5E7EB' }
  ];
  const recentBadges = statsData?.recentBadges ?? [];

  const stats = [
    {
      label: 'Weekly Completion',
      value: `${weeklyCompletion}%`,
      change: weeklyChange,
      changeType: weeklyChange.startsWith('+') ? 'positive' : weeklyChange.startsWith('-') ? 'negative' : 'neutral',
      icon: 'TrendingUp',
      color: 'text-success'
    },
    {
      label: 'Current Streak',
      value: `${streak} days`,
      change: longestStreak > streak ? `Best: ${longestStreak}` : '+0',
      changeType: 'positive',
      icon: 'Zap',
      color: 'text-warning'
    },
    {
      label: 'Total Routines',
      value: String(totalRoutines),
      change: activeRoutines > 0 ? `${activeRoutines} Active` : '—',
      changeType: 'positive',
      icon: 'Calendar',
      color: 'text-primary'
    },
    {
      label: 'Achievements',
      value: String(totalBadges),
      change: 'Badges',
      changeType: 'positive',
      icon: 'Award',
      color: 'text-secondary'
    }
  ];

  return (
    <div className="bg-surface rounded-xl p-6 shadow-sm border border-border mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary flex items-center">
          <Icon name="BarChart3" size={24} className="mr-2 text-primary" />
          Quick Stats
        </h2>
        <button className="text-text-secondary hover:text-text-primary transition-colors">
          <Icon name="MoreHorizontal" size={20} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? (
          <div className="col-span-2 lg:col-span-4 flex items-center justify-center py-8 text-text-secondary">
            Loading stats...
          </div>
        ) : stats.map((stat, index) => (
          <div
            key={index}
            className="bg-surface-secondary rounded-lg p-4 border border-border hover:border-primary-200 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <Icon name={stat.icon} size={20} className={stat.color} />
              <span className={`text-xs font-medium ${
                stat.changeType === 'positive' ? 'text-success' : stat.changeType === 'negative' ? 'text-error' : 'text-text-secondary'
              }`}>
                {stat.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-text-primary mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-text-secondary">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Completion Chart */}
        <div className="bg-surface-secondary rounded-lg p-4 border border-border">
          <h3 className="text-lg font-medium text-text-primary mb-4 flex items-center">
            <Icon name="BarChart" size={18} className="mr-2 text-primary" />
            Weekly Progress
          </h3>
          <div className="h-48" aria-label="Weekly completion rate bar chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChartData}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <YAxis hide />
                <Bar 
                  dataKey="completed" 
                  fill="#4F46E5" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Completion Rate Pie Chart */}
        <div className="bg-surface-secondary rounded-lg p-4 border border-border">
          <h3 className="text-lg font-medium text-text-primary mb-4 flex items-center">
            <Icon name="PieChart" size={18} className="mr-2 text-primary" />
            Overall Completion
          </h3>
          <div className="h-48 flex items-center justify-center" aria-label="Overall completion rate pie chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={completionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {completionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-4 mt-2">
            {completionData.map((entry, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-text-secondary">
                  {entry.name}: {entry.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="mt-6 bg-gradient-to-r from-success-50 to-primary-50 rounded-lg p-4 border border-success-200">
        <h3 className="text-lg font-medium text-text-primary mb-3 flex items-center">
          <Icon name="Trophy" size={18} className="mr-2 text-success" />
          Recent Achievements
        </h3>
        <div className="flex flex-wrap gap-2">
          {loading ? (
            <span className="text-text-secondary text-sm">Loading...</span>
          ) : recentBadges.length > 0 ? (
            recentBadges.map((achievement, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium bg-primary text-primary-foreground"
              >
                <Icon name={achievement.icon || 'Award'} size={16} />
                <span>{achievement.name}</span>
              </div>
            ))
          ) : (
            <span className="text-text-secondary text-sm">Complete tasks and routines to earn badges</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickStats;