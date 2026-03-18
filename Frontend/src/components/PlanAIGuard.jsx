import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../contexts/AuthContext';
import { useRole } from './ui/RoleBasedRouter';

const MESSAGES = {
  routine: 'AI Routine is not included in your plan. Upgrade to Premium to use AI Routine.',
  chat: 'AI Assistant is not included in your plan. Upgrade to Basic or Premium to use AI Chat.'
};

/**
 * Wraps AI pages (AI Routine, AI Chat). Redirects when the user's plan
 * does not allow that specific feature. Admins bypass the check.
 * @param {'routine'|'chat'} feature - which AI feature to check
 */
export default function PlanAIGuard({ feature, children }) {
  const { user } = useAuth();
  const { userRole } = useRole();
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    if (!user) {
      setAllowed(false);
      return;
    }
    if (userRole === 'admin') {
      setAllowed(true);
      return;
    }
    const key = feature === 'routine' ? 'allowAIRoutine' : 'allowAIChat';
    let cancelled = false;
    axiosClient
      .get('/api/auth/plan-limits')
      .then(({ data }) => {
        if (!cancelled) setAllowed(data?.limits?.[key] === true);
      })
      .catch(() => {
        if (!cancelled) setAllowed(false);
      });
    return () => { cancelled = true; };
  }, [user, userRole, feature]);

  if (allowed === null) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-text-secondary">
        Loading...
      </div>
    );
  }

  if (!allowed) {
    return (
      <Navigate
        to="/home-dashboard"
        state={{ message: MESSAGES[feature] || 'This AI feature is not included in your plan.' }}
        replace
      />
    );
  }

  return children;
}
