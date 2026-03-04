import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useAccessibility } from '../../../components/ui/AccessibilityNavWrapper';

const ProgressCharts = ({ 
  weeklyData = [], 
  monthlyData = [], 
  categoryData = [],
  streakData = [],
  currentStreak = 0,
  totalPoints = 0
}) => {
  const { getNavigationClasses, effectiveSettings } = useAccessibility();
  const [selectedChart, setSelectedChart] = useState('weekly');
  const [selectedTimeframe, setSelectedTimeframe] = useState('7days');

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

  // Custom tooltip for accessibility
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

  // Colors for charts (accessibility-friendly)
  const chartColors = {
    primary: effectiveSettings.highContrast ? '#0000FF' : '#4F46E5',
    success: effectiveSettings.highContrast ? '#008000' : '#10B981',
    warning: effectiveSettings.highContrast ? '#FF8C00' : '#F59E0B',
    error: effectiveSettings.highContrast ? '#FF0000' : '#EF4444',
    secondary: effectiveSettings.highContrast ? '#800080' : '#8B5CF6'
  };

  const pieColors = [
    chartColors.primary,
    chartColors.success,
    chartColors.warning,
    chartColors.error,
    chartColors.secondary
  ];

  const WeeklyChart = () => (
    <div className="h-64" role="img" aria-label="Weekly progress bar chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={effectiveSettings.highContrast ? '#000000' : '#E5E7EB'} />
          <XAxis 
            dataKey="day" 
            stroke={effectiveSettings.highContrast ? '#000000' : '#6B7280'}
            fontSize={12}
          />
          <YAxis 
            stroke={effectiveSettings.highContrast ? '#000000' : '#6B7280'}
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="completed" 
            fill={chartColors.primary}
            name="Completed Tasks"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="total" 
            fill={chartColors.success}
            name="Total Tasks"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const StreakChart = () => (
    <div className="h-64" role="img" aria-label="Streak trends line chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={streakData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={effectiveSettings.highContrast ? '#000000' : '#E5E7EB'} />
          <XAxis 
            dataKey="date" 
            stroke={effectiveSettings.highContrast ? '#000000' : '#6B7280'}
            fontSize={12}
          />
          <YAxis 
            stroke={effectiveSettings.highContrast ? '#000000' : '#6B7280'}
            fontSize={12}
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
          Complete tasks from your routines to see a breakdown by routine category.
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

  const getChartDescription = () => {
    switch (selectedChart) {
      case 'weekly':
        return "Bar chart showing completed vs total tasks for each day of the week";
      case 'streak':
        return "Line chart displaying streak length over time";
      case 'categories':
        return "Pie chart breaking down task completion by category";
      default:
        return "Progress visualization chart";
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">
          Progress Analytics
        </h3>
        <div className="flex items-center space-x-2">
          <Icon name="BarChart3" size={20} className="text-text-secondary" />
        </div>
      </div>

      {/* Chart Type Selection */}
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
            <span className="hidden sm:block">{chart.label}</span>
          </button>
        ))}
      </div>

      {/* Timeframe Selection (for applicable charts) */}
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
                    ? 'bg-primary-100 text-primary-700' :'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
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
        <div 
          className="sr-only" 
          aria-live="polite"
          aria-label={getChartDescription()}
        >
          {getChartDescription()}
        </div>
        {renderChart()}
      </div>

      {/* Chart Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <div className="text-2xl font-bold text-text-primary mb-1">
            {selectedChart === 'weekly' ? weeklyData.reduce((sum, day) => sum + (day.completed || 0), 0) : currentStreak}
          </div>
          <div className="text-xs text-text-secondary">
            {selectedChart === 'weekly' ? 'Tasks Completed' : 'Current Streak'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-text-primary mb-1">
            {selectedChart === 'weekly' && weeklyData.length > 0
              ? Math.round((weeklyData.reduce((sum, day) => sum + (day.completed || 0), 0) / Math.max(1, weeklyData.reduce((sum, day) => sum + (day.total || 1), 0))) * 100)
              : selectedChart === 'streak' && currentStreak > 0 ? Math.min(100, currentStreak * 10) : 0}%
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
            {selectedChart === 'weekly' ? weeklyData.filter(d => (d.completed || 0) > 0).length : selectedChart === 'streak' ? streakData.length : currentStreak}
          </div>
          <div className="text-xs text-text-secondary">
            Days Active
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="flex justify-end mt-4 pt-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          iconName="Download"
          iconPosition="left"
          onClick={() => {
            // Mock export functionality
            console.log('Exporting chart data...');
          }}
        >
          Export Data
        </Button>
      </div>
    </div>
  );
};

export default ProgressCharts;