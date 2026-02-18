import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProgressCharts = ({ 
  selectedClient, 
  accessibilitySettings 
}) => {
  const [activeChart, setActiveChart] = useState('completion');
  const [timeRange, setTimeRange] = useState('week');

  // Mock chart data - in real app this would come from API
  const completionData = [
    { day: 'Mon', completed: 8, total: 10, percentage: 80 },
    { day: 'Tue', completed: 9, total: 10, percentage: 90 },
    { day: 'Wed', completed: 7, total: 10, percentage: 70 },
    { day: 'Thu', completed: 10, total: 10, percentage: 100 },
    { day: 'Fri', completed: 6, total: 10, percentage: 60 },
    { day: 'Sat', completed: 8, total: 10, percentage: 80 },
    { day: 'Sun', completed: 9, total: 10, percentage: 90 }
  ];

  const streakData = [
    { week: 'Week 1', streak: 5 },
    { week: 'Week 2', streak: 7 },
    { week: 'Week 3', streak: 3 },
    { week: 'Week 4', streak: 12 },
    { week: 'Week 5', streak: 8 },
    { week: 'Week 6', streak: 15 }
  ];

  const routineBreakdown = [
    { name: 'Morning Routine', value: 35, color: '#4F46E5' },
    { name: 'Work Tasks', value: 25, color: '#7C3AED' },
    { name: 'Exercise', value: 20, color: '#10B981' },
    { name: 'Evening Routine', value: 15, color: '#F59E0B' },
    { name: 'Self Care', value: 5, color: '#EF4444' }
  ];

  const chartTypes = [
    { id: 'completion', label: 'Daily Completion', icon: 'BarChart3' },
    { id: 'streak', label: 'Streak Trends', icon: 'TrendingUp' },
    { id: 'breakdown', label: 'Routine Breakdown', icon: 'PieChart' }
  ];

  const timeRanges = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'Last 3 Months' }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-border rounded-lg p-3 shadow-lg">
          <p className="text-text-primary font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {activeChart === 'completion' && '%'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const chartProps = {
      width: '100%',
      height: 300,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (activeChart) {
      case 'completion':
        return (
          <ResponsiveContainer {...chartProps}>
            <BarChart data={completionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="day" 
                stroke="var(--color-text-secondary)"
                fontSize={12}
              />
              <YAxis 
                stroke="var(--color-text-secondary)"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="percentage" 
                fill="var(--color-primary)" 
                name="Completion Rate"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'streak':
        return (
          <ResponsiveContainer {...chartProps}>
            <LineChart data={streakData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="week" 
                stroke="var(--color-text-secondary)"
                fontSize={12}
              />
              <YAxis 
                stroke="var(--color-text-secondary)"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="streak" 
                stroke="var(--color-success)" 
                strokeWidth={3}
                dot={{ fill: 'var(--color-success)', strokeWidth: 2, r: 6 }}
                name="Streak Days"
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'breakdown':
        return (
          <ResponsiveContainer {...chartProps}>
            <PieChart>
              <Pie
                data={routineBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {routineBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  if (!selectedClient) {
    return (
      <div className="bg-surface rounded-lg border border-border p-8 text-center">
        <Icon name="BarChart3" size={48} className="mx-auto mb-4 text-text-tertiary" />
        <h3 className="text-lg font-medium text-text-primary mb-2">
          Select a Client
        </h3>
        <p className="text-text-secondary">
          Choose a client from the list to view their progress charts and analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-1">
            Progress Analytics
          </h2>
          <p className="text-text-secondary">
            {selectedClient.name} • ID: {selectedClient.id}
          </p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            aria-label="Select time range"
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          
          <Button
            variant="outline"
            iconName="Download"
            onClick={() => {/* Export functionality */}}
            aria-label="Export chart data"
          >
            Export
          </Button>
        </div>
      </div>

      {/* Chart Type Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {chartTypes.map((chart) => (
          <Button
            key={chart.id}
            variant={activeChart === chart.id ? 'primary' : 'outline'}
            iconName={chart.icon}
            iconPosition="left"
            onClick={() => setActiveChart(chart.id)}
            className="text-sm"
          >
            {chart.label}
          </Button>
        ))}
      </div>

      {/* Chart Container */}
      <div className="bg-surface-secondary rounded-lg p-4 mb-6">
        <div 
          className="w-full"
          role="img"
          aria-label={`${chartTypes.find(c => c.id === activeChart)?.label} chart for ${selectedClient.name}`}
        >
          {renderChart()}
        </div>
      </div>

      {/* Chart Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-success-50 border border-success-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="TrendingUp" size={20} className="text-success" />
            <span className="font-medium text-success">Improvement</span>
          </div>
          <p className="text-sm text-text-secondary">
            Completion rate increased by 15% this week compared to last week.
          </p>
        </div>

        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="AlertTriangle" size={20} className="text-warning" />
            <span className="font-medium text-warning">Attention Needed</span>
          </div>
          <p className="text-sm text-text-secondary">
            Morning routine completion has been inconsistent for 3 days.
          </p>
        </div>

        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Target" size={20} className="text-primary" />
            <span className="font-medium text-primary">Goal Progress</span>
          </div>
          <p className="text-sm text-text-secondary">
            On track to achieve 85% completion rate goal by month end.
          </p>
        </div>
      </div>

      {/* Accessibility Description */}
      <div className="sr-only">
        <h3>Chart Data Summary</h3>
        {activeChart === 'completion' && (
          <p>
            Weekly completion rates: Monday 80%, Tuesday 90%, Wednesday 70%, 
            Thursday 100%, Friday 60%, Saturday 80%, Sunday 90%. 
            Average completion rate is 81%.
          </p>
        )}
        {activeChart === 'streak' && (
          <p>
            Streak progression over 6 weeks: Week 1: 5 days, Week 2: 7 days, 
            Week 3: 3 days, Week 4: 12 days, Week 5: 8 days, Week 6: 15 days. 
            Current streak is at its highest point.
          </p>
        )}
        {activeChart === 'breakdown' && (
          <p>
            Routine distribution: Morning Routine 35%, Work Tasks 25%, 
            Exercise 20%, Evening Routine 15%, Self Care 5%.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProgressCharts;