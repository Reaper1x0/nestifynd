import React, { useState, useEffect } from 'react';

import Icon from '../../../components/AppIcon';
import axiosClient from '../../../api/axiosClient';

const AssignmentsView = ({ onUpdate, accessibilitySettings }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get('/api/admin/assignments');
      setAssignments(Array.isArray(data) ? data : []);
    } catch (e) {
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (typeof onUpdate === 'function') {
      const id = setInterval(load, 30000);
      return () => clearInterval(id);
    }
  }, [onUpdate]);

  if (loading) {
    return (
      <div className="p-8 text-center text-text-secondary animate-pulse-gentle">
        Loading assignments...
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="p-8 text-center text-text-secondary">
        <Icon name="UserPlus" size={48} className="mx-auto mb-3 opacity-50" />
        <p>No assignments yet</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-secondary border-b border-border">
              <th className="text-left px-4 py-3 font-medium text-text-primary">User (client)</th>
              <th className="text-left px-4 py-3 font-medium text-text-primary">Therapist/Caregiver</th>
              <th className="text-left px-4 py-3 font-medium text-text-primary">Type</th>
              <th className="text-left px-4 py-3 font-medium text-text-primary">Assigned by</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((a) => (
              <tr key={a._id} className="border-b border-border hover:bg-surface-secondary/50">
                <td className="px-4 py-3">
                  <p className="font-medium text-text-primary">{a.userId?.name || '-'}</p>
                  <p className="text-xs text-text-secondary">{a.userId?.email || '-'}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-text-primary">{a.relatedUserId?.name || '-'}</p>
                  <p className="text-xs text-text-secondary">{a.relatedUserId?.email || '-'}</p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      a.relationshipType === 'therapist'
                        ? 'bg-primary-50 text-primary'
                        : 'bg-accent-50 text-accent-600'
                    }`}
                  >
                    {a.relationshipType || '-'}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-secondary">{a.createdBy?.name || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssignmentsView;
