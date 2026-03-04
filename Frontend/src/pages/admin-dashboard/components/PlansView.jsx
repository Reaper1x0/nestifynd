import React, { useState, useEffect } from 'react';

import Icon from '../../../components/AppIcon';
import axiosClient from '../../../api/axiosClient';

const PlansView = ({ accessibilitySettings }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await axiosClient.get('/api/plans');
        setPlans(Array.isArray(data) ? data : []);
      } catch (e) {
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-text-secondary animate-pulse-gentle">
        Loading plans...
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="p-8 text-center text-text-secondary">
        <Icon name="CreditCard" size={48} className="mx-auto mb-3 opacity-50" />
        <p>No plans configured</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {plans.map((p) => (
        <div
          key={p._id}
          className="bg-surface border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold text-text-primary">{p.name}</h3>
          <p className="text-2xl font-bold text-primary mt-2">
            ${p.price ?? 0}
            <span className="text-sm font-normal text-text-secondary">/{p.interval || 'month'}</span>
          </p>
          {p.features && p.features.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm text-text-secondary">
              {p.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Icon name="Check" size={14} className="text-success-600 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default PlansView;
