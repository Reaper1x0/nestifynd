import React, { useState, useEffect } from 'react';

import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import axiosClient from '../../../api/axiosClient';

const ReportsView = ({ accessibilitySettings }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get('/api/reports');
      setReports(Array.isArray(data) ? data : []);
    } catch (e) {
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleDownloadAll = async () => {
    try {
      const res = await axiosClient.get('/api/reports/download/all', {
        responseType: 'blob'
      });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `all_weekly_reports_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (e) {
      console.error('Download failed:', e);
      alert(e.response?.data?.error || 'Failed to download reports');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-text-secondary">
          Weekly reports: reminders sent, tasks completed/pending, snoozes, dismissals
        </p>
        <Button iconName="Download" onClick={handleDownloadAll} disabled={loading}>
          Download All CSV
        </Button>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-secondary animate-pulse-gentle">
            Loading reports...
          </div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center text-text-secondary">
            <Icon name="FileText" size={48} className="mx-auto mb-3 opacity-50" />
            <p>No reports data available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-secondary border-b border-border">
                  <th className="text-left px-4 py-3 font-medium text-text-primary">User</th>
                  <th className="text-left px-4 py-3 font-medium text-text-primary">Reminders</th>
                  <th className="text-left px-4 py-3 font-medium text-text-primary">Completed</th>
                  <th className="text-left px-4 py-3 font-medium text-text-primary">Pending</th>
                  <th className="text-left px-4 py-3 font-medium text-text-primary">Snoozes</th>
                  <th className="text-left px-4 py-3 font-medium text-text-primary">Dismissals</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r, i) => (
                  <tr key={r.user?.id || i} className="border-b border-border hover:bg-surface-secondary/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-primary">{r.user?.name || '-'}</p>
                      <p className="text-xs text-text-secondary">{r.user?.email || '-'}</p>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {r.activities?.reminders ?? 0}
                    </td>
                    <td className="px-4 py-3 text-success-600">
                      {r.tasks?.completed ?? 0}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {r.tasks?.pending ?? 0}
                    </td>
                    <td className="px-4 py-3 text-warning-600">
                      {r.activities?.snoozes ?? 0}
                    </td>
                    <td className="px-4 py-3 text-error-600">
                      {r.activities?.dismissals ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsView;
