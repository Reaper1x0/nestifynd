import React, { useState, useEffect } from 'react';

import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import UserEditModal from './UserEditModal';
import axiosClient from '../../../api/axiosClient';

const UserManagement = ({ onUpdate, accessibilitySettings }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (roleFilter) params.role = roleFilter;
      const { data } = await axiosClient.get('/api/admin/users', { params });
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter]);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setSelectedUser(null);
    loadUsers();
    onUpdate?.();
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-surface text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg bg-surface text-text-primary focus:ring-2 focus:ring-primary"
        >
          <option value="">All roles</option>
          <option value="user">User</option>
          <option value="therapist">Therapist</option>
          <option value="caregiver">Caregiver</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-secondary animate-pulse-gentle">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-text-secondary">
            <Icon name="Users" size={48} className="mx-auto mb-3 opacity-50" />
            <p>No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-secondary border-b border-border">
                  <th className="text-left px-4 py-3 font-medium text-text-primary">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-text-primary">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-text-primary">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-text-primary">Plan</th>
                  <th className="text-left px-4 py-3 font-medium text-text-primary">UI Mode</th>
                  <th className="text-right px-4 py-3 font-medium text-text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-border hover:bg-surface-secondary/50">
                    <td className="px-4 py-3 text-text-primary">{u.name || '-'}</td>
                    <td className="px-4 py-3 text-text-secondary">{u.email || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary">
                        {u.role?.name || u.role?.displayName || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{u.plan?.name || '-'}</td>
                    <td className="px-4 py-3 text-text-secondary">{u.uiMode?.name || 'Default'}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        iconName="Settings"
                        onClick={() => handleEdit(u)}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UserEditModal
        isOpen={showEditModal}
        user={selectedUser}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default UserManagement;
