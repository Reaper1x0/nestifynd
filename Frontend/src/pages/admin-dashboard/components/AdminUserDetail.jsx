import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '../../../components/ui/Button';
import AdminUserOverview from './AdminUserOverview';
import AdminProgressCharts from './AdminProgressCharts';
import AdminRoutinesManager from './AdminRoutinesManager';
import UserEditModal from './UserEditModal';
import axiosClient from '../../../api/axiosClient';

/**
 * Admin user detail view - same structure as therapist dashboard for selected user.
 * Shows Overview, Analytics (ProgressCharts), Routines, and Edit modal.
 */
const AdminUserDetail = ({
  users,
  selectedUser,
  onUserSelect,
  onUsersRefresh,
  accessibilitySettings
}) => {
  const navigate = useNavigate();
  const [activeSubView, setActiveSubView] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const handleOpenEdit = async () => {
    if (!selectedUser?.id) return;
    try {
      const { data } = await axiosClient.get(`/api/admin/users/by-id/${selectedUser.id}`);
      setEditUser(data);
      setShowEditModal(true);
    } catch (e) {
      setEditUser(selectedUser);
      setShowEditModal(true);
    }
  };

  const viewOptions = [
    { id: 'overview', label: 'Overview', icon: 'Grid3x3' },
    { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
    { id: 'routines', label: 'Routines', icon: 'Calendar' }
  ];

  const renderContent = () => {
    switch (activeSubView) {
      case 'overview':
        return (
          <AdminUserOverview
            users={users}
            selectedUser={selectedUser}
            onUserSelect={onUserSelect}
            accessibilitySettings={accessibilitySettings}
          />
        );
      case 'analytics':
        return (
          <AdminProgressCharts
            selectedUser={selectedUser}
            accessibilitySettings={accessibilitySettings}
          />
        );
      case 'routines':
        return (
          <AdminRoutinesManager
            userId={selectedUser?.id}
            userName={selectedUser?.name}
            onNavigateToBuilder={({ clientId: cid, routineId }) => {
              const params = new URLSearchParams();
              if (cid) params.set('clientId', cid);
              if (routineId) params.set('edit', routineId);
              params.set('returnTo', '/admin-dashboard');
              navigate(`/routine-builder?${params.toString()}`);
            }}
            onUpdate={onUsersRefresh}
            accessibilitySettings={accessibilitySettings}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Sub-navigation */}
      <div className="flex flex-wrap gap-2">
        {viewOptions.map((v) => (
          <Button
            key={v.id}
            variant={activeSubView === v.id ? 'primary' : 'outline'}
            iconName={v.icon}
            iconPosition="left"
            onClick={() => setActiveSubView(v.id)}
            className="text-sm"
          >
            {v.label}
          </Button>
        ))}
        {selectedUser && (
          <Button
            variant="outline"
            iconName="Settings"
            iconPosition="left"
            onClick={handleOpenEdit}
            className="text-sm ml-auto"
          >
            Edit User
          </Button>
        )}
      </div>

      {renderContent()}

      <UserEditModal
        isOpen={showEditModal}
        user={editUser}
        onClose={() => {
          setShowEditModal(false);
          setEditUser(null);
          onUsersRefresh?.();
        }}
      />
    </div>
  );
};

export default AdminUserDetail;
