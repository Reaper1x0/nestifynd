import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import axiosClient from '../../../api/axiosClient';
import { useAuth } from '../../../contexts/AuthContext';

const AccountSection = ({
  user: authUser,
  settings,
  onSettingChange,
  isExpanded,
  onToggleExpanded
}) => {
  const { updateUser, logout } = useAuth();
  
  // Determine user role
  const userRole = authUser?.role?.name || authUser?.role || localStorage.getItem('userRole') || 'user';
  const isCaregiverOrTherapist = ['caregiver', 'therapist'].includes(userRole);

  const [profileData, setProfileData] = useState({
    name: authUser?.name || settings.profileName || '',
    email: authUser?.email || settings.profileEmail || '',
    phone: settings.profilePhone || '',
    emergencyContact: settings.emergencyContact || '',
    emergencyPhone: settings.emergencyPhone || ''
  });

  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);
  const [caregiverConnections, setCaregiverConnections] = useState([]);
  const [exportingType, setExportingType] = useState(null);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    if (authUser?.name) setProfileData((p) => ({ ...p, name: authUser.name }));
    if (authUser?.email) setProfileData((p) => ({ ...p, email: authUser.email }));
  }, [authUser?.name, authUser?.email]);

  useEffect(() => {
    const userId = authUser?.id || localStorage.getItem('userId');
    if (!userId) return;

    const loadProfile = async () => {
      try {
        const { data } = await axiosClient.get('/api/auth/profile');
        setProfileData(prev => ({
          ...prev,
          name: data.name || prev.name,
          email: data.email || prev.email,
          phone: data.phoneNumber || prev.phone,
          emergencyContact: data.emergencyContact?.name || prev.emergencyContact,
          emergencyPhone: data.emergencyContact?.phone || prev.emergencyPhone
        }));
      } catch { /* use existing data */ }
    };

    const loadCaregivers = async () => {
      try {
        if (isCaregiverOrTherapist) {
          // For caregivers/therapists: load users who assigned them
          const { data } = await axiosClient.get('/api/user-assignments/my-users');
          const reverseMap = {
            canViewReports: 'view_progress',
            canReceiveNotifications: 'send_messages',
            canOverrideSettings: 'modify_routines'
          };
          const list = (Array.isArray(data) ? data : []).map((a) => {
            const perms = [];
            if (a.permissions) {
              Object.entries(a.permissions).forEach(([k, v]) => {
                if (v && reverseMap[k]) perms.push(reverseMap[k]);
              });
            }
            return {
              id: a._id,
              assignmentId: a._id,
              userId: a.userId?._id || a.userId,
              name: a.userId?.name || 'User',
              role: 'User',
              email: a.userId?.email || '',
              status: a.isActive !== false ? 'active' : 'pending',
              permissions: perms
            };
          });
          setCaregiverConnections(list);
        } else {
          // For regular users: load their assigned caregivers/therapists
          const { data } = await axiosClient.get(`/api/user-assignments/${userId}`);
          const reverseMap = {
            canViewReports: 'view_progress',
            canReceiveNotifications: 'send_messages',
            canOverrideSettings: 'modify_routines'
          };
          const list = (Array.isArray(data) ? data : []).map((a) => {
            const perms = [];
            if (a.permissions) {
              Object.entries(a.permissions).forEach(([k, v]) => {
                if (v && reverseMap[k]) perms.push(reverseMap[k]);
              });
            }
            return {
              id: a._id,
              assignmentId: a._id,
              name: a.relatedUserId?.name || 'Caregiver',
              role: a.relationshipType === 'therapist' ? 'Therapist' : 'Caregiver',
              email: a.relatedUserId?.email || '',
              status: a.isActive !== false ? 'active' : 'pending',
              permissions: perms
            };
          });
          setCaregiverConnections(list);
        }
      } catch {
        setCaregiverConnections([]);
      }
    };

    loadProfile();
    loadCaregivers();
  }, [authUser?.id, isCaregiverOrTherapist]);

  const [showAddCaregiver, setShowAddCaregiver] = useState(false);
  const [showAddTherapist, setShowAddTherapist] = useState(false);
  const [addConnectionEmail, setAddConnectionEmail] = useState('');
  const [addConnectionLookup, setAddConnectionLookup] = useState(null);
  const [addConnectionError, setAddConnectionError] = useState('');
  const [addConnectionSearching, setAddConnectionSearching] = useState(false);
  const [addConnectionAdding, setAddConnectionAdding] = useState(false);
  const addConnectionMode = showAddTherapist ? 'therapist' : showAddCaregiver ? 'caregiver' : null;

  const [showAddClient, setShowAddClient] = useState(false);
  const [addClientEmail, setAddClientEmail] = useState('');
  const [addClientLookup, setAddClientLookup] = useState(null);
  const [addClientError, setAddClientError] = useState('');
  const [addClientSearching, setAddClientSearching] = useState(false);
  const [addClientAdding, setAddClientAdding] = useState(false);

  const handleLookupConnection = async (roleFilter) => {
    const email = addConnectionEmail.trim();
    if (!email) return;
    setAddConnectionSearching(true);
    setAddConnectionError('');
    setAddConnectionLookup(null);
    try {
      const params = new URLSearchParams({ email });
      if (roleFilter) params.set('role', roleFilter);
      const { data } = await axiosClient.get(`/api/user-assignments/lookup?${params}`);
      setAddConnectionLookup(data);
    } catch (err) {
      setAddConnectionError(err.response?.data?.error || 'User not found');
    } finally {
      setAddConnectionSearching(false);
    }
  };

  const handleAddConnection = async () => {
    if (!addConnectionLookup) return;
    setAddConnectionAdding(true);
    setAddConnectionError('');
    try {
      const userId = authUser?.id || localStorage.getItem('userId');
      await axiosClient.post('/api/user-assignments', {
        userId,
        relatedUserId: addConnectionLookup.id
      });
      const { data } = await axiosClient.get(`/api/user-assignments/${userId}`);
      const reverseMap = { canViewReports: 'view_progress', canReceiveNotifications: 'send_messages', canOverrideSettings: 'modify_routines' };
      const list = (Array.isArray(data) ? data : []).map((a) => {
        const perms = [];
        if (a.permissions) Object.entries(a.permissions).forEach(([k, v]) => { if (v && reverseMap[k]) perms.push(reverseMap[k]); });
        return { id: a._id, assignmentId: a._id, name: a.relatedUserId?.name || 'Caregiver', role: a.relationshipType === 'therapist' ? 'Therapist' : 'Caregiver', email: a.relatedUserId?.email || '', status: a.isActive !== false ? 'active' : 'pending', permissions: perms };
      });
      setCaregiverConnections(list);
      setShowAddCaregiver(false);
      setShowAddTherapist(false);
      setAddConnectionEmail('');
      setAddConnectionLookup(null);
    } catch (err) {
      setAddConnectionError(err.response?.data?.error || 'Failed to add connection');
    } finally {
      setAddConnectionAdding(false);
    }
  };

  const closeAddForm = () => {
    setShowAddCaregiver(false);
    setShowAddTherapist(false);
    setAddConnectionError('');
    setAddConnectionLookup(null);
    setAddConnectionEmail('');
  };

  const closeAddClientForm = () => {
    setShowAddClient(false);
    setAddClientEmail('');
    setAddClientLookup(null);
    setAddClientError('');
  };

  const handleLookupClient = async () => {
    const email = addClientEmail.trim();
    if (!email) return;
    setAddClientSearching(true);
    setAddClientError('');
    setAddClientLookup(null);
    try {
      const { data } = await axiosClient.get(`/api/therapists/lookup-client?email=${encodeURIComponent(email)}`);
      setAddClientLookup(data);
    } catch (err) {
      setAddClientError(err.response?.data?.error || 'User not found');
    } finally {
      setAddClientSearching(false);
    }
  };

  const handleAddClient = async () => {
    if (!addClientLookup) return;
    setAddClientAdding(true);
    setAddClientError('');
    try {
      await axiosClient.post('/api/therapists/clients', { userId: addClientLookup.id });
      const { data } = await axiosClient.get('/api/user-assignments/my-users');
      const reverseMap = { canViewReports: 'view_progress', canReceiveNotifications: 'send_messages', canOverrideSettings: 'modify_routines' };
      const list = (Array.isArray(data) ? data : []).map((a) => {
        const perms = [];
        if (a.permissions) Object.entries(a.permissions).forEach(([k, v]) => { if (v && reverseMap[k]) perms.push(reverseMap[k]); });
        return { id: a._id, assignmentId: a._id, userId: a.userId?._id || a.userId, name: a.userId?.name || 'User', role: 'User', email: a.userId?.email || '', status: a.isActive !== false ? 'active' : 'pending', permissions: perms };
      });
      setCaregiverConnections(list);
      closeAddClientForm();
    } catch (err) {
      setAddClientError(err.response?.data?.error || 'Failed to add client');
    } finally {
      setAddClientAdding(false);
    }
  };

  const [privacySettings, setPrivacySettings] = useState({
    shareProgress: settings.shareProgress !== undefined ? settings.shareProgress : true,
    shareRoutines: settings.shareRoutines !== undefined ? settings.shareRoutines : true,
    allowMessages: settings.allowMessages !== undefined ? settings.allowMessages : true,
    dataCollection: settings.dataCollection || "essential"
  });

  useEffect(() => {
    setPrivacySettings({
      shareProgress: settings.shareProgress !== undefined ? settings.shareProgress : true,
      shareRoutines: settings.shareRoutines !== undefined ? settings.shareRoutines : true,
      allowMessages: settings.allowMessages !== undefined ? settings.allowMessages : true,
      dataCollection: settings.dataCollection || "essential"
    });
  }, [settings.shareProgress, settings.shareRoutines, settings.allowMessages, settings.dataCollection]);

  const dataExportOptions = [
    { id: 'routines', label: 'Routine Data', description: 'All created routines and templates' },
    { id: 'progress', label: 'Progress Reports', description: 'Completion history and statistics' },
    { id: 'messages', label: 'Messages', description: 'Communication history' },
    { id: 'settings', label: 'Settings', description: 'All preferences and configurations' }
  ];

  const emergencyResources = [
    { name: "Crisis Text Line", contact: "Text HOME to 741741", description: "24/7 crisis support via text" },
    { name: "National Suicide Prevention Lifeline", contact: "988", description: "24/7 phone support" },
    { name: "Autism Society Helpline", contact: "1-800-328-8476", description: "Information and referral services" }
  ];

  const handleProfileUpdate = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    onSettingChange(`profile${field.charAt(0).toUpperCase() + field.slice(1)}`, value);
  };

  const saveProfile = async () => {
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const payload = {
        name: profileData.name,
        email: profileData.email,
        phoneNumber: profileData.phone,
        emergencyContact: {
          name: profileData.emergencyContact,
          phone: profileData.emergencyPhone
        }
      };
      const { data } = await axiosClient.put('/api/auth/profile', payload);
      updateUser({ name: profileData.name, email: profileData.email });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully' });
    } catch (err) {
      const msg = err.response?.data?.msg || 'Failed to update profile';
      setProfileMsg({ type: 'error', text: msg });
    } finally {
      setProfileSaving(false);
      setTimeout(() => setProfileMsg(null), 4000);
    }
  };

  const handlePrivacyChange = (setting, value) => {
    setPrivacySettings(prev => ({ ...prev, [setting]: value }));
    onSettingChange(setting, value);
  };

  const handleCaregiverPermissionChange = async (caregiverId, permission, enabled) => {
    const caregiver = caregiverConnections.find(c => c.id === caregiverId);
    if (!caregiver) return;

    const updatedPermissions = enabled
      ? [...caregiver.permissions, permission]
      : caregiver.permissions.filter(p => p !== permission);

    setCaregiverConnections(prev =>
      prev.map(c => c.id === caregiverId ? { ...c, permissions: updatedPermissions } : c)
    );

    try {
      const permObj = {};
      ['view_progress', 'send_messages', 'modify_routines'].forEach(p => {
        permObj[p] = updatedPermissions.includes(p);
      });
      await axiosClient.put(`/api/user-assignments/${caregiverId}`, { permissions: permObj });
    } catch {
      setCaregiverConnections(prev =>
        prev.map(c => c.id === caregiverId ? { ...c, permissions: caregiver.permissions } : c)
      );
    }
  };

  const downloadJson = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportData = async (dataTypes) => {
    const key = dataTypes.join(',');
    setExportingType(key);
    try {
      const { data } = await axiosClient.post('/api/auth/export', { types: dataTypes });
      const filename = `nestifynd-export-${dataTypes.join('-')}-${new Date().toISOString().split('T')[0]}.json`;
      downloadJson(data, filename);
    } catch {
      const fallback = {
        timestamp: new Date().toISOString(),
        user: profileData.name,
        data: dataTypes.reduce((acc, type) => {
          acc[type] = `Export data for ${type}`;
          return acc;
        }, {})
      };
      const filename = `nestifynd-export-${dataTypes.join('-')}-${new Date().toISOString().split('T')[0]}.json`;
      downloadJson(fallback, filename);
    } finally {
      setExportingType(null);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently removed.')) return;
    if (!window.confirm('This is your last chance. Type DELETE in the next prompt to confirm.')) return;
    const confirmation = window.prompt('Type DELETE to confirm account deletion:');
    if (confirmation !== 'DELETE') {
      alert('Account deletion cancelled.');
      return;
    }

    setDeletingAccount(true);
    try {
      await axiosClient.delete('/api/auth/account');
      alert('Your account has been deactivated. You will be logged out.');
      logout();
    } catch {
      alert('Failed to delete account. Please try again.');
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-border shadow-sm">
      <button
        onClick={onToggleExpanded}
        className="w-full flex items-center justify-between p-6 text-left focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
        aria-expanded={isExpanded}
        aria-controls="account-settings"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-warning-50 rounded-lg flex items-center justify-center">
            <Icon name="User" size={20} className="text-warning" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Account</h2>
            <p className="text-sm text-text-secondary">Profile and privacy settings</p>
          </div>
        </div>
        <Icon
          name={isExpanded ? "ChevronUp" : "ChevronDown"}
          size={20}
          className="text-text-secondary"
        />
      </button>

      {isExpanded && (
        <div id="account-settings" className="px-6 pb-6 space-y-6">
          {/* Profile Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-text-primary">Profile Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">Full Name</label>
                <Input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => handleProfileUpdate('name', e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">Email Address</label>
                <Input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleProfileUpdate('email', e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">Phone Number</label>
                <Input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => handleProfileUpdate('phone', e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {profileMsg && (
              <div className={`p-3 rounded-lg text-sm ${
                profileMsg.type === 'success'
                  ? 'bg-success-50 text-success-800 border border-success-200'
                  : 'bg-error-50 text-error-800 border border-error-200'
              }`}>
                {profileMsg.text}
              </div>
            )}

            <Button
              variant="primary"
              onClick={saveProfile}
              disabled={profileSaving}
              iconName={profileSaving ? 'Loader2' : 'Save'}
              iconPosition="left"
            >
              {profileSaving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-text-primary">Emergency Contact</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">Contact Name</label>
                <Input
                  type="text"
                  value={profileData.emergencyContact}
                  onChange={(e) => handleProfileUpdate('emergencyContact', e.target.value)}
                  placeholder="Emergency contact name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">Contact Phone</label>
                <Input
                  type="tel"
                  value={profileData.emergencyPhone}
                  onChange={(e) => handleProfileUpdate('emergencyPhone', e.target.value)}
                  placeholder="Emergency contact phone"
                />
              </div>
            </div>
          </div>

          {/* Caregiver/User Connections */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-medium text-text-primary">
                {isCaregiverOrTherapist ? 'Assigned Users' : 'Caregiver & Therapist Connections'}
              </h3>
              {userRole === 'therapist' && (
                <Button
                  variant="outline"
                  iconName="UserPlus"
                  iconPosition="left"
                  onClick={() => {
                    if (showAddClient) closeAddClientForm();
                    else { setShowAddClient(true); setAddClientError(''); setAddClientLookup(null); setAddClientEmail(''); }
                  }}
                >
                  {showAddClient ? 'Cancel' : 'Add Client'}
                </Button>
              )}
              {!isCaregiverOrTherapist && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    iconName="UserPlus"
                    iconPosition="left"
                    onClick={() => {
                      if (showAddTherapist) closeAddForm();
                      else { setShowAddTherapist(true); setShowAddCaregiver(false); setAddConnectionError(''); setAddConnectionLookup(null); setAddConnectionEmail(''); }
                    }}
                  >
                    {showAddTherapist ? 'Cancel' : 'Add Therapist'}
                  </Button>
                  <Button
                    variant="outline"
                    iconName="Heart"
                    iconPosition="left"
                    onClick={() => {
                      if (showAddCaregiver) closeAddForm();
                      else { setShowAddCaregiver(true); setShowAddTherapist(false); setAddConnectionError(''); setAddConnectionLookup(null); setAddConnectionEmail(''); }
                    }}
                  >
                    {showAddCaregiver ? 'Cancel' : 'Add Caregiver'}
                  </Button>
                </div>
              )}
            </div>

            {isCaregiverOrTherapist && (
              <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Icon name="Info" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-primary-800">
                      {userRole === 'therapist' ? 'How to add clients' : 'How to connect with users'}
                    </div>
                    <div className="text-xs text-primary-700 mt-1">
                      {userRole === 'therapist' ? (
                        <>
                          You can add clients from Settings by clicking &quot;Add Client&quot; and searching by email. 
                          Users can also add you as their therapist from their Settings page — share your email (<span className="font-medium">{profileData.email}</span>) with users who want to connect.
                        </>
                      ) : (
                        <>
                          Users can add you as their {userRole} from their Settings page. 
                          Share your email address (<span className="font-medium">{profileData.email}</span>) with users who want to connect with you.
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {userRole === 'therapist' && showAddClient && (
              <div className="p-4 bg-surface-secondary rounded-lg border border-border space-y-3">
                <p className="text-xs text-text-secondary">
                  Enter the email address of the user you want to add as your client.
                </p>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-text-primary mb-1">Email Address</label>
                    <Input
                      type="email"
                      value={addClientEmail}
                      onChange={(e) => setAddClientEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLookupClient()}
                      placeholder="client@example.com"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleLookupClient}
                    disabled={addClientSearching || !addClientEmail.trim()}
                    iconName={addClientSearching ? 'Loader2' : 'Search'}
                    iconPosition="left"
                  >
                    {addClientSearching ? 'Searching...' : 'Search'}
                  </Button>
                </div>
                {addClientError && (
                  <div className="p-3 bg-error-50 border border-error-200 rounded-lg text-sm text-error-800">
                    {addClientError}
                  </div>
                )}
                {addClientLookup && (
                  <div className="p-3 bg-success-50 border border-success-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary font-semibold text-sm">
                            {addClientLookup.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-text-primary">{addClientLookup.name}</div>
                          <div className="text-xs text-text-secondary">{addClientLookup.email}</div>
                        </div>
                      </div>
                      <Button
                        variant="primary"
                        onClick={handleAddClient}
                        disabled={addClientAdding}
                        iconName={addClientAdding ? 'Loader2' : 'UserPlus'}
                        iconPosition="left"
                      >
                        {addClientAdding ? 'Adding...' : 'Add Client'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isCaregiverOrTherapist && (showAddCaregiver || showAddTherapist) && (
              <div className="p-4 bg-surface-secondary rounded-lg border border-border space-y-3">
                <p className="text-xs text-text-secondary">
                  Enter the email address of the {addConnectionMode === 'therapist' ? 'therapist' : 'caregiver'} you want to connect with.
                </p>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-text-primary mb-1">Email Address</label>
                    <Input
                      type="email"
                      value={addConnectionEmail}
                      onChange={(e) => setAddConnectionEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLookupConnection(addConnectionMode)}
                      placeholder={addConnectionMode === 'therapist' ? 'therapist@example.com' : 'caregiver@example.com'}
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleLookupConnection(addConnectionMode)}
                    disabled={addConnectionSearching || !addConnectionEmail.trim()}
                    iconName={addConnectionSearching ? 'Loader2' : 'Search'}
                    iconPosition="left"
                  >
                    {addConnectionSearching ? 'Searching...' : 'Search'}
                  </Button>
                </div>

                {addConnectionError && (
                  <div className="p-3 bg-error-50 border border-error-200 rounded-lg text-sm text-error-800">
                    {addConnectionError}
                  </div>
                )}

                {addConnectionLookup && (
                  <div className="p-3 bg-success-50 border border-success-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary font-semibold text-sm">
                            {addConnectionLookup.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-text-primary">{addConnectionLookup.name}</div>
                          <div className="text-xs text-text-secondary capitalize">{addConnectionLookup.role} &bull; {addConnectionLookup.email}</div>
                        </div>
                      </div>
                      <Button
                        variant="primary"
                        onClick={handleAddConnection}
                        disabled={addConnectionAdding}
                        iconName={addConnectionAdding ? 'Loader2' : 'UserPlus'}
                        iconPosition="left"
                      >
                        {addConnectionAdding ? 'Adding...' : 'Add'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              {caregiverConnections.length === 0 && !showAddCaregiver && !showAddTherapist && !showAddClient && (
                <p className="text-sm text-text-secondary py-4 text-center">
                  {userRole === 'therapist'
                    ? 'No clients yet. Click "Add Client" to add clients by email, or share your email with users who want to connect.'
                    : isCaregiverOrTherapist
                    ? 'No users have assigned you yet. Share your email address with users who want to connect.'
                    : 'No connections yet. Click "Add Therapist" or "Add Caregiver" to connect.'}
                </p>
              )}
              {caregiverConnections.map((connection) => (
                <div key={connection.id} className="p-4 bg-surface-secondary rounded-lg border border-border">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center">
                        <Icon name="User" size={20} className="text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-text-primary">{connection.name}</div>
                        <div className="text-xs text-text-secondary">{connection.role} &bull; {connection.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        connection.status === 'active' ? 'bg-success-100 text-success-800' : 'bg-warning-100 text-warning-800'
                      }`}>
                        {connection.status}
                      </span>
                      {!isCaregiverOrTherapist && (
                        <Button
                          variant="ghost"
                          iconName="Trash2"
                          onClick={async () => {
                            if (!window.confirm('Remove this connection?')) return;
                            const aid = connection.assignmentId || connection.id;
                            try {
                              await axiosClient.delete(`/api/user-assignments/${aid}`);
                              setCaregiverConnections((prev) => prev.filter((c) => String(c.assignmentId || c.id) !== String(aid)));
                            } catch {
                              alert('Failed to remove.');
                            }
                          }}
                          aria-label="Remove connection"
                        />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-medium text-text-primary">
                      {isCaregiverOrTherapist ? 'Granted Permissions:' : 'Permissions:'}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['view_progress', 'send_messages', 'modify_routines'].map((permission) => (
                        <label key={permission} className="flex items-center space-x-2 text-xs">
                          <input
                            type="checkbox"
                            checked={connection.permissions.includes(permission)}
                            onChange={(e) => !isCaregiverOrTherapist && handleCaregiverPermissionChange(connection.id, permission, e.target.checked)}
                            disabled={isCaregiverOrTherapist}
                            className="w-3 h-3 text-primary border-border rounded focus:ring-primary disabled:opacity-50"
                          />
                          <span className={`capitalize ${isCaregiverOrTherapist ? 'text-text-tertiary' : 'text-text-secondary'}`}>
                            {permission.replace('_', ' ')}
                          </span>
                        </label>
                      ))}
                    </div>
                    {isCaregiverOrTherapist && (
                      <p className="text-xs text-text-tertiary mt-1">
                        Permissions are managed by the user from their settings.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Settings - Only for regular users */}
          {!isCaregiverOrTherapist && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-text-primary">Privacy Settings</h3>
              <div className="space-y-3">
                {[
                  { key: 'shareProgress', label: 'Share Progress Data', desc: 'Allow caregivers to view your progress' },
                  { key: 'shareRoutines', label: 'Share Routine Data', desc: 'Allow caregivers to view your routines' },
                  { key: 'allowMessages', label: 'Allow Messages', desc: 'Receive messages from caregivers' }
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-surface-secondary rounded-lg">
                    <div className="min-w-0 flex-1 mr-4">
                      <div className="text-sm font-medium text-text-primary">{label}</div>
                      <div className="text-xs text-text-secondary">{desc}</div>
                    </div>
                    <button
                      onClick={() => handlePrivacyChange(key, !privacySettings[key])}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                        privacySettings[key] ? 'bg-primary' : 'bg-border'
                      }`}
                      role="switch"
                      aria-checked={privacySettings[key]}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        privacySettings[key] ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Export */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-text-primary">Data Export</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dataExportOptions.map((option) => (
                <div key={option.id} className="p-4 bg-surface-secondary rounded-lg border border-border">
                  <div className="text-sm font-medium text-text-primary mb-1">{option.label}</div>
                  <div className="text-xs text-text-secondary mb-3">{option.description}</div>
                  <Button
                    variant="outline"
                    onClick={() => exportData([option.id])}
                    disabled={exportingType === option.id}
                    iconName={exportingType === option.id ? 'Loader2' : 'Download'}
                    iconPosition="left"
                    className="w-full"
                  >
                    {exportingType === option.id ? 'Exporting...' : 'Export'}
                  </Button>
                </div>
              ))}
            </div>

            <Button
              variant="primary"
              onClick={() => exportData(dataExportOptions.map(opt => opt.id))}
              disabled={exportingType === dataExportOptions.map(o => o.id).join(',')}
              iconName={exportingType ? 'Loader2' : 'Download'}
              iconPosition="left"
              className="w-full"
            >
              {exportingType === dataExportOptions.map(o => o.id).join(',') ? 'Exporting...' : 'Export All Data'}
            </Button>
          </div>

          {/* Emergency Resources */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-text-primary">Crisis Resources</h3>
            <div className="space-y-3">
              {emergencyResources.map((resource, index) => (
                <div key={index} className="p-4 bg-error-50 border border-error-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Icon name="Phone" size={20} className="text-error flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-error-800">{resource.name}</div>
                      <div className="text-sm text-error-700 font-mono">{resource.contact}</div>
                      <div className="text-xs text-error-600 mt-1">{resource.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Account Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => {
                if (confirm('Are you sure you want to reset all settings to defaults?')) {
                  onSettingChange('_resetAll', true);
                  window.location.reload();
                }
              }}
              iconName="RotateCcw"
              iconPosition="left"
            >
              Reset All Settings
            </Button>

            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              iconName={deletingAccount ? 'Loader2' : 'Trash2'}
              iconPosition="left"
            >
              {deletingAccount ? 'Deleting...' : 'Delete Account'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSection;
