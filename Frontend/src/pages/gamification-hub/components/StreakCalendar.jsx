import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { useAccessibility } from '../../../components/ui/AccessibilityNavWrapper';

const StreakCalendar = ({ streakData, currentStreak = 0, longestStreak = 0 }) => {
  const { getNavigationClasses, effectiveSettings } = useAccessibility();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const getStreakStatus = (date) => {
    const today = new Date();
    const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    if (dateDay > todayDay) return 'none';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    return streakData[dateStr] || 'none';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete':
        return effectiveSettings.highContrast 
          ? 'bg-green-600 border-2 border-green-800' :'bg-success';
      case 'partial':
        return effectiveSettings.highContrast 
          ? 'bg-yellow-500 border-2 border-yellow-700' :'bg-warning';
      case 'missed':
        return effectiveSettings.highContrast 
          ? 'bg-red-600 border-2 border-red-800' :'bg-error';
      default:
        return 'bg-surface-secondary';
    }
  };

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 11) {
        setSelectedMonth(0);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="w-8 h-8" aria-hidden="true" />
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, selectedMonth, day);
      const status = getStreakStatus(date);
      const isToday = date.toDateString() === new Date().toDateString();

      days.push(
        <div
          key={day}
          className={`
            w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
            ${getStatusColor(status)}
            ${isToday ? 'ring-2 ring-primary ring-offset-1' : ''}
            ${status !== 'none' ? 'text-white' : 'text-text-secondary'}
            ${getNavigationClasses('transition-all duration-200')}
          `}
          role="gridcell"
          aria-label={`${months[selectedMonth]} ${day}, ${selectedYear}. Status: ${status}`}
          title={`${months[selectedMonth]} ${day}: ${status}`}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      {/* Header with Streak Stats */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            Streak Calendar
          </h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Icon name="Flame" size={16} className="text-warning" />
              <span className="text-text-secondary">Current:</span>
              <span className="font-semibold text-text-primary">{currentStreak} days</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="Trophy" size={16} className="text-success" />
              <span className="text-text-secondary">Best:</span>
              <span className="font-semibold text-text-primary">{longestStreak} days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth('prev')}
          className={`
            p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-secondary
            ${getNavigationClasses('transition-colors duration-200')}
          `}
          aria-label="Previous month"
        >
          <Icon name="ChevronLeft" size={20} />
        </button>

        <h4 className="text-base font-semibold text-text-primary">
          {months[selectedMonth]} {selectedYear}
        </h4>

        <button
          onClick={() => navigateMonth('next')}
          className={`
            p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-secondary
            ${getNavigationClasses('transition-colors duration-200')}
          `}
          aria-label="Next month"
        >
          <Icon name="ChevronRight" size={20} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-2">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div 
              key={day} 
              className="w-8 h-6 flex items-center justify-center text-xs font-medium text-text-secondary"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div 
          className="grid grid-cols-7 gap-1"
          role="grid"
          aria-label={`Calendar for ${months[selectedMonth]} ${selectedYear}`}
        >
          {renderCalendarDays()}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-secondary font-medium">Legend:</span>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span className="text-text-secondary">Complete</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-warning" />
              <span className="text-text-secondary">Partial</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-error" />
              <span className="text-text-secondary">Missed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreakCalendar;