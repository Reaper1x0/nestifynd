import React, { useState, useEffect } from 'react';

import AdminUserSidebar from './AdminUserSidebar';
import AdminUserOverview from './AdminUserOverview';
import AdminUserDetail from './AdminUserDetail';
import axiosClient from '../../../api/axiosClient';

/**
 * Admin users view - full access like therapist dashboard.
 * Sidebar with users, overview grid, and detail (analytics, routines) for selected user.
 */
const AdminUsersView = ({ onUpdate, accessibilitySettings }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUsers = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const { data } = await axiosClient.get('/api/admin/users/reports');
      const list = (data.reports || []).map((r) => ({
        ...r,
        id: r.clientId?.toString?.() || r.clientId || r.id
      }));
      setUsers(list);
    } catch (e) {
      setUsers([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(true);
  }, []);

  const refreshUsersInBackground = () => loadUsers(false);

  return (
    <div className="flex h-[calc(100vh-12rem)] min-h-[400px] gap-4">
      {/* Sidebar - visible on lg+ */}
      <div className="hidden lg:block shrink-0">
        <AdminUserSidebar
          users={users}
          selectedUser={selectedUser}
          onUserSelect={setSelectedUser}
          accessibilitySettings={accessibilitySettings}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 overflow-auto">
        {loading ? (
          <div className="bg-surface rounded-lg border border-border p-8 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3" />
            <p className="text-text-secondary">Loading users...</p>
          </div>
        ) : selectedUser ? (
          <div>
            {/* Mobile: back button when user selected */}
            <button
              onClick={() => setSelectedUser(null)}
              className="lg:hidden text-sm text-primary mb-2 flex items-center gap-2 hover:underline"
            >
              ← Back to list
            </button>
            <AdminUserDetail
              users={users}
              selectedUser={selectedUser}
              onUserSelect={setSelectedUser}
              onUsersRefresh={refreshUsersInBackground}
              accessibilitySettings={accessibilitySettings}
            />
          </div>
        ) : (
          <AdminUserOverview
            users={users}
            selectedUser={null}
            onUserSelect={setSelectedUser}
            accessibilitySettings={accessibilitySettings}
          />
        )}
      </div>
    </div>
  );
};

export default AdminUsersView;
