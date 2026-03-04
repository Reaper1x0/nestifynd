import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import axiosClient from '../../../api/axiosClient';

const AdminProgressCharts = ({ selectedUser, accessibilitySettings }) => {
  const [selectedChart, setSelectedChart] = useState('weekly');
  const [selectedTimeframe, setSelectedTimeframe] = useState('7days');
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(false);

  const timeRangeMap = { '7days': '7d', '30days': '30d', '90days': '90d' };
  const apiRange = timeRangeMap[selectedTimeframe] || '7d';

  useEffect(() => {
    if (!selectedUser?.id) {
      setProgressData(null);
      return;
    }
    setLoading(true);
    axiosClient
      .get(`/api/admin/users/${selectedUser.id}/progress?range=${apiRange}`)
      .then(({ data }) => setProgressData(data))
      .catch(() => setProgressData(null))
      .finally(() => setLoading(false));
  }, [selectedUser?.id, apiRange]);

  const weeklyData = progressData?.weeklyChartData ?? [];
  const categoryData = progressData?.categoryData ?? [];
  const currentStreak = progressData?.streak?.currentStreak ?? 0;
  const totalPoints = progressData?.totalPointsEarned ?? 0;

  const streakChartData = (() => {
    const cal = progressData?.streakCalendar ?? {};
    const dates = Object.keys(cal).filter((d) => cal[d] === 'complete').sort();
    if (dates.length === 0) return [];
    const result = [];
    let streak = 0;
    const oneDay = 24 * 60 * 60 * 1000;
    for (let i = 0; i < dates.length; i++) {
      const prev = i > 0 ? new Date(dates[i - 1]).getTime() : 0;
      const curr = new Date(dates[i]).getTime();
      if (i === 0 || curr - prev > oneDay + 1) streak = 1;
      else streak++;
      result.push({
        date: new Date(dates[i]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        streak
      });
    }
    return result.slice(-(apiRange === '7d' ? 7 : apiRange === '30d' ? 14 : 30));
  })();

  const chartColors = { primary: '#4F46E5', success: '#10B981', warning: '#F59E0B', error: '#EF4444', secondary: '#8B5CF6' };
  const pieColors = [chartColors.primary, chartColors.success, chartColors.warning, chartColors.error, chartColors.secondary];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length)
      return (
        <div className="bg-surface border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-text-primary mb-1">{label}</p>
          {payload.map((e, i) => (
            <p key={i} className="text-sm text-text-secondary">
              <span style={{ color: e.color }}>{e.name}: </span>
              {e.value}
            </p>
          ))}
        </div>
      );
    return null;
  };

  const tasksCompleted = weeklyData.reduce((s, d) => s + (d.completed || 0), 0);
  const completionRate =
    weeklyData.length > 0
      ? Math.round(
          (tasksCompleted / Math.max(1, weeklyData.reduce((s, d) => s + (d.total || 1), 0))) * 100
        )
      : 0;

  if (!selectedUser) {
    return (
      <div className="bg-surface rounded-lg border border-border p-8 text-center">
        <Icon name="BarChart3" size={48} className="mx-auto mb-4 text-text-tertiary" />
        <h3 className="text-lg font-medium text-text-primary mb-2">Select a User</h3>
        <p className="text-text-secondary">Choose a user from the list to view their progress charts.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Progress Analytics</h3>
          <p className="text-text-secondary text-sm">{selectedUser.name}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { id: 'weekly', label: 'Weekly Progress', icon: 'BarChart3' },
          { id: 'streak', label: 'Streak Trends', icon: 'TrendingUp' },
          { id: 'categories', label: 'Task Categories', icon: 'PieChart' }
        ].map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedChart(c.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
              selectedChart === c.id ? 'bg-primary text-primary-foreground' : 'bg-surface-secondary text-text-secondary'
            }`}
          >
            <Icon name={c.icon} size={16} />
            {c.label}
          </button>
        ))}
      </div>

      {(selectedChart === 'weekly' || selectedChart === 'streak') && (
        <div className="flex gap-2 mb-4">
          {['7days', '30days', '90days'].map((tf) => (
            <button
              key={tf}
              onClick={() => setSelectedTimeframe(tf)}
              className={`px-3 py-1 rounded text-sm font-medium ${
                selectedTimeframe === tf ? 'bg-primary-100 text-primary-700' : 'text-text-secondary hover:bg-surface-secondary'
              }`}
            >
              {tf === '7days' ? '7 Days' : tf === '30days' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      )}

      <div className="mb-4">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Icon name="Loader2" size={32} className="animate-spin text-primary" />
          </div>
        ) : selectedChart === 'weekly' ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey={apiRange === '7d' ? 'day' : 'label'} stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} domain={[0, 'auto']} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="completed" fill={chartColors.primary} name="Completed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total" fill={chartColors.success} name="Total" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : selectedChart === 'streak' ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={streakChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} domain={[0, 'auto']} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="streak" stroke={chartColors.warning} strokeWidth={3} name="Streak Days" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {categoryData.map((e, i) => (
                      <Cell key={i} fill={pieColors[i % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-text-secondary text-sm">Complete tasks to see category breakdown.</p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <div className="text-2xl font-bold text-text-primary">{selectedChart === 'weekly' ? tasksCompleted : currentStreak}</div>
          <div className="text-xs text-text-secondary">
            {selectedChart === 'weekly' ? 'Tasks Completed' : 'Current Streak'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-text-primary">{completionRate}%</div>
          <div className="text-xs text-text-secondary">Completion Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-text-primary">{totalPoints}</div>
          <div className="text-xs text-text-secondary">Total Points</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-text-primary">
            {selectedChart === 'categories' ? categoryData.length : streakChartData.length}
          </div>
          <div className="text-xs text-text-secondary">
            {selectedChart === 'categories' ? 'Categories' : 'Days Active'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProgressCharts;
