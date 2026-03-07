import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import axiosClient from '../../../api/axiosClient';
import { useAccessibility } from '../../../components/ui/AccessibilityNavWrapper';

/**
 * Therapist ProgressCharts - Matches client gamification hub ProgressCharts layout exactly.
 */
const ProgressCharts = ({ selectedClient }) => {
  const { getNavigationClasses, effectiveSettings } = useAccessibility();
  const [selectedChart, setSelectedChart] = useState('weekly');
  const [selectedTimeframe, setSelectedTimeframe] = useState('7days');
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const timeRangeMap = { '7days': '7d', '30days': '30d', '90days': '90d' };
  const apiRange = timeRangeMap[selectedTimeframe] || '7d';

  useEffect(() => {
    if (!selectedClient?.id) {
      setProgressData(null);
      return;
    }
    setLoading(true);
    axiosClient
      .get(`/api/therapists/clients/${selectedClient.id}/progress?range=${apiRange}`)
      .then(({ data }) => setProgressData(data))
      .catch(() => setProgressData(null))
      .finally(() => setLoading(false));
  }, [selectedClient?.id, apiRange]);

  const weeklyData = progressData?.weeklyChartData ?? [];
  const categoryData = progressData?.categoryData ?? [];
  const currentStreak = progressData?.streak?.currentStreak ?? 0;
  const totalPoints = progressData?.totalPointsEarned ?? 0;

  const streakChartData = (() => {
    const cal = progressData?.streakCalendar ?? {};
    const dates = Object.keys(cal).filter(d => cal[d] === 'complete').sort();
    if (dates.length === 0) return [];
    const result = [];
    let streak = 0;
    const oneDay = 24 * 60 * 60 * 1000;
    for (let i = 0; i < dates.length; i++) {
      const prev = i > 0 ? new Date(dates[i - 1]).getTime() : 0;
      const curr = new Date(dates[i]).getTime();
      if (i === 0 || curr - prev > oneDay + 1) streak = 1;
      else streak++;
      const d = new Date(dates[i]);
      result.push({ date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), streak });
    }
    const limit = apiRange === '7d' ? 7 : apiRange === '30d' ? 14 : 30;
    return result.slice(-limit);
  })();

  const chartTypes = [
    { id: 'weekly', label: 'Weekly Progress', icon: 'BarChart3' },
    { id: 'streak', label: 'Streak Trends', icon: 'TrendingUp' },
    { id: 'categories', label: 'Task Categories', icon: 'PieChart' }
  ];

  const timeframes = [
    { id: '7days', label: '7 Days' },
    { id: '30days', label: '30 Days' },
    { id: '90days', label: '90 Days' }
  ];

  const chartColors = {
    primary: effectiveSettings?.highContrast ? '#0000FF' : '#4F46E5',
    success: effectiveSettings?.highContrast ? '#008000' : '#10B981',
    warning: effectiveSettings?.highContrast ? '#FF8C00' : '#F59E0B',
    error: effectiveSettings?.highContrast ? '#FF0000' : '#EF4444',
    secondary: effectiveSettings?.highContrast ? '#800080' : '#8B5CF6'
  };

  const pieColors = [
    chartColors.primary,
    chartColors.success,
    chartColors.warning,
    chartColors.error,
    chartColors.secondary
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-text-primary mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm text-text-secondary">
              <span style={{ color: entry.color }}>{entry.name}: </span>
              {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleExport = () => {
    if (!progressData || !selectedClient) return;
    setExporting(true);
    try {
      let csv = `Client,${selectedClient.name}\nID,${selectedClient.id}\nRange,${apiRange}\n\n`;
      if (selectedChart === 'weekly') {
        csv += 'Day,Completed,Total\n';
        weeklyData.forEach(row => {
          csv += `${row.day || row.label},${row.completed ?? 0},${row.total ?? 0}\n`;
        });
      } else if (selectedChart === 'streak') {
        csv += 'Date,Streak Days\n';
        streakChartData.forEach(row => {
          csv += `${row.date},${row.streak}\n`;
        });
      } else {
        csv += 'Category,Count\n';
        categoryData.forEach(row => {
          csv += `${row.name},${row.value}\n`;
        });
      }
      csv += `\nSummary\nTotal Points,${totalPoints}\nCurrent Streak,${currentStreak}\n`;
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `progress-${selectedClient.name}-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const tasksCompleted = weeklyData.reduce((sum, d) => sum + (d.completed || 0), 0);
  const daysActive = apiRange === '7d'
    ? weeklyData.filter(d => (d.completed || 0) > 0).length
    : streakChartData.length;

  const completionRate = weeklyData.length > 0
    ? Math.round((tasksCompleted / Math.max(1, weeklyData.reduce((s, d) => s + (d.total || 1), 0))) * 100)
    : 0;

  const successRate = selectedChart === 'streak' && currentStreak > 0 ? Math.min(100, currentStreak * 10) : 0;

  const WeeklyChart = () => (
    <div className="h-64" role="img" aria-label="Weekly progress bar chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={effectiveSettings?.highContrast ? '#000000' : '#E5E7EB'} />
          <XAxis
            dataKey={apiRange === '7d' ? 'day' : 'label'}
            stroke={effectiveSettings?.highContrast ? '#000000' : '#6B7280'}
            fontSize={12}
          />
          <YAxis
            stroke={effectiveSettings?.highContrast ? '#000000' : '#6B7280'}
            fontSize={12}
            domain={[0, 'auto']}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="completed" fill={chartColors.primary} name="Completed Tasks" radius={[4, 4, 0, 0]} isAnimationActive={false} />
          <Bar dataKey="total" fill={chartColors.success} name="Total Tasks" radius={[4, 4, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const StreakChart = () => (
    <div className="h-64" role="img" aria-label="Streak trends line chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={streakChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={effectiveSettings?.highContrast ? '#000000' : '#E5E7EB'} />
          <XAxis
            dataKey="date"
            stroke={effectiveSettings?.highContrast ? '#000000' : '#6B7280'}
            fontSize={12}
          />
          <YAxis
            stroke={effectiveSettings?.highContrast ? '#000000' : '#6B7280'}
            fontSize={12}
            domain={[0, 'auto']}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="streak"
            stroke={chartColors.warning}
            strokeWidth={3}
            dot={{ fill: chartColors.warning, strokeWidth: 2, r: 4 }}
            name="Streak Days"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const CategoryChart = () => (
    <div className="h-64 flex items-center justify-center" role="img" aria-label="Task categories pie chart">
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
              fill="#8884d8"
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-text-secondary text-sm text-center px-4">
          Complete tasks from routines to see a breakdown by routine category.
        </p>
      )}
    </div>
  );

  const renderChart = () => {
    switch (selectedChart) {
      case 'weekly':
        return <WeeklyChart />;
      case 'streak':
        return <StreakChart />;
      case 'categories':
        return <CategoryChart />;
      default:
        return <WeeklyChart />;
    }
  };

  if (!selectedClient) {
    return (
      <div className="bg-surface rounded-lg border border-border p-8 text-center">
        <Icon name="BarChart3" size={48} className="mx-auto mb-4 text-text-tertiary" />
        <h3 className="text-lg font-medium text-text-primary mb-2">Select a Client</h3>
        <p className="text-text-secondary">Choose a client from the list to view their progress charts.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      {/* Header - matches client */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Progress Analytics</h3>
          <p className="text-text-secondary text-sm mt-0.5">{selectedClient.name} • ID: {String(selectedClient.id).slice(0, 6)}.{String(selectedClient.id).slice(-4)}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="BarChart3" size={20} className="text-text-secondary" />
        </div>
      </div>

      {/* Chart Type Selection - matches client */}
      <div className="flex flex-wrap gap-2 mb-4">
        {chartTypes.map(chart => (
          <button
            key={chart.id}
            onClick={() => setSelectedChart(chart.id)}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium
              ${selectedChart === chart.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-surface-secondary text-text-secondary hover:text-text-primary'
              }
              ${getNavigationClasses('transition-colors duration-200')}
            `}
            aria-pressed={selectedChart === chart.id}
          >
            <Icon name={chart.icon} size={16} />
            <span className="hidden sm:inline">{chart.label}</span>
          </button>
        ))}
      </div>

      {/* Timeframe Selection - matches client (for weekly and streak) */}
      {(selectedChart === 'weekly' || selectedChart === 'streak') && (
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-sm text-text-secondary">Timeframe:</span>
          <div className="flex space-x-1">
            {timeframes.map(timeframe => (
              <button
                key={timeframe.id}
                onClick={() => setSelectedTimeframe(timeframe.id)}
                className={`
                  px-3 py-1 rounded text-sm font-medium
                  ${selectedTimeframe === timeframe.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                  }
                  ${getNavigationClasses('transition-colors duration-200')}
                `}
                aria-pressed={selectedTimeframe === timeframe.id}
              >
                {timeframe.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chart Container */}
      <div className="mb-4">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Icon name="Loader2" size={32} className="animate-spin text-primary" />
          </div>
        ) : (
          renderChart()
        )}
      </div>

      {/* Chart Summary - matches client exactly */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <div className="text-2xl font-bold text-text-primary mb-1">
            {selectedChart === 'weekly' ? tasksCompleted : currentStreak}
          </div>
          <div className="text-xs text-text-secondary">
            {selectedChart === 'weekly' ? 'Tasks Completed' : 'Current Streak'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-text-primary mb-1">
            {selectedChart === 'weekly' && weeklyData.length > 0
              ? completionRate
              : selectedChart === 'streak' ? successRate : 0}%
          </div>
          <div className="text-xs text-text-secondary">
            {selectedChart === 'weekly' ? 'Completion Rate' : 'Success Rate'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-text-primary mb-1">
            {selectedChart === 'categories' ? categoryData.length : totalPoints}
          </div>
          <div className="text-xs text-text-secondary">
            {selectedChart === 'categories' ? 'Categories' : 'Total Points'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-text-primary mb-1">
            {selectedChart === 'weekly' ? daysActive : selectedChart === 'streak' ? streakChartData.length : currentStreak}
          </div>
          <div className="text-xs text-text-secondary">Days Active</div>
        </div>
      </div>

      {/* Export - matches client */}
      <div className="flex justify-end mt-4 pt-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          iconName="Download"
          iconPosition="left"
          onClick={handleExport}
          disabled={!progressData || exporting}
        >
          {exporting ? 'Exporting...' : 'Export Data'}
        </Button>
      </div>
    </div>
  );
};

export default ProgressCharts;
