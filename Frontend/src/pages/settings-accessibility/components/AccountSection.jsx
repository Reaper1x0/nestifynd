import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const AccountSection = ({ 
  settings, 
  onSettingChange, 
  isExpanded, 
  onToggleExpanded 
}) => {
  const [profileData, setProfileData] = useState({
    name: settings.profileName || "Alex Johnson",
    email: settings.profileEmail || "alex.johnson@email.com",
    phone: settings.profilePhone || "+1 (555) 123-4567",
    emergencyContact: settings.emergencyContact || "Sarah Johnson",
    emergencyPhone: settings.emergencyPhone || "+1 (555) 987-6543"
  });

  const [caregiverConnections, setCaregiverConnections] = useState([
    {
      id: 1,
      name: "Dr. Emily Chen",
      role: "Therapist",
      email: "dr.chen@therapy.com",
      status: "active",
      permissions: ["view_progress", "send_messages", "modify_routines"]
    },
    {
      id: 2,
      name: "Mom (Sarah Johnson)",
      role: "Family Caregiver",
      email: "sarah.j@email.com",
      status: "active",
      permissions: ["view_progress", "send_messages"]
    },
    {
      id: 3,
      name: "Care Coordinator",
      role: "Support Staff",
      email: "coordinator@careservice.com",
      status: "pending",
      permissions: ["view_progress"]
    }
  ]);

  const [privacySettings, setPrivacySettings] = useState({
    shareProgress: settings.shareProgress || true,
    shareLocation: settings.shareLocation || false,
    shareRoutines: settings.shareRoutines || true,
    allowMessages: settings.allowMessages || true,
    dataCollection: settings.dataCollection || "essential"
  });

  const dataExportOptions = [
    { id: 'routines', label: 'Routine Data', description: 'All created routines and templates' },
    { id: 'progress', label: 'Progress Reports', description: 'Completion history and statistics' },
    { id: 'messages', label: 'Messages', description: 'Communication history' },
    { id: 'settings', label: 'Settings', description: 'All preferences and configurations' }
  ];

  const emergencyResources = [
    {
      name: "Crisis Text Line",
      contact: "Text HOME to 741741",
      description: "24/7 crisis support via text"
    },
    {
      name: "National Suicide Prevention Lifeline",
      contact: "988",
      description: "24/7 phone support"
    },
    {
      name: "Autism Society Helpline",
      contact: "1-800-328-8476",
      description: "Information and referral services"
    }
  ];

  const handleProfileUpdate = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
    onSettingChange(`profile${field.charAt(0).toUpperCase() + field.slice(1)}`, value);
  };

  const handlePrivacyChange = (setting, value) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: value
    }));
    onSettingChange(setting, value);
  };

  const handleCaregiverPermissionChange = (caregiverId, permission, enabled) => {
    setCaregiverConnections(prev => 
      prev.map(caregiver => {
        if (caregiver.id === caregiverId) {
          const updatedPermissions = enabled
            ? [...caregiver.permissions, permission]
            : caregiver.permissions.filter(p => p !== permission);
          return { ...caregiver, permissions: updatedPermissions };
        }
        return caregiver;
      })
    );
  };

  const exportData = (dataTypes) => {
    // Mock data export functionality
    const exportData = {
      timestamp: new Date().toISOString(),
      user: profileData.name,
      data: dataTypes.reduce((acc, type) => {
        acc[type] = `Mock ${type} data would be exported here`;
        return acc;
      }, {})
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nestifynd-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
                <label className="block text-xs font-medium text-text-primary mb-1">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => handleProfileUpdate('name', e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleProfileUpdate('email', e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => handleProfileUpdate('phone', e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-text-primary">Emergency Contact</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">
                  Contact Name
                </label>
                <Input
                  type="text"
                  value={profileData.emergencyContact}
                  onChange={(e) => handleProfileUpdate('emergencyContact', e.target.value)}
                  placeholder="Emergency contact name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">
                  Contact Phone
                </label>
                <Input
                  type="tel"
                  value={profileData.emergencyPhone}
                  onChange={(e) => handleProfileUpdate('emergencyPhone', e.target.value)}
                  placeholder="Emergency contact phone"
                />
              </div>
            </div>
          </div>

          {/* Caregiver Connections */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-text-primary">Caregiver Connections</h3>
              <Button
                variant="outline"
                iconName="Plus"
                iconPosition="left"
                onClick={() => {
                  // Mock add caregiver functionality
                  alert('Add caregiver functionality would open here');
                }}
              >
                Add Caregiver
              </Button>
            </div>
            
            <div className="space-y-3">
              {caregiverConnections.map((caregiver) => (
                <div key={caregiver.id} className="p-4 bg-surface-secondary rounded-lg border border-border">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center">
                        <Icon name="User" size={20} className="text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-text-primary">
                          {caregiver.name}
                        </div>
                        <div className="text-xs text-text-secondary">
                          {caregiver.role} • {caregiver.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`
                        px-2 py-1 text-xs rounded-full
                        ${caregiver.status === 'active' ?'bg-success-100 text-success-800' :'bg-warning-100 text-warning-800'
                        }
                      `}>
                        {caregiver.status}
                      </span>
                      <Button
                        variant="ghost"
                        iconName="MoreVertical"
                        onClick={() => {
                          // Mock caregiver options
                          alert('Caregiver options would open here');
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-text-primary">Permissions:</div>
                    <div className="flex flex-wrap gap-2">
                      {['view_progress', 'send_messages', 'modify_routines'].map((permission) => (
                        <label
                          key={permission}
                          className="flex items-center space-x-2 text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={caregiver.permissions.includes(permission)}
                            onChange={(e) => handleCaregiverPermissionChange(
                              caregiver.id, 
                              permission, 
                              e.target.checked
                            )}
                            className="w-3 h-3 text-primary border-border rounded focus:ring-primary"
                          />
                          <span className="text-text-secondary capitalize">
                            {permission.replace('_', ' ')}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-text-primary">Privacy Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg">
                <div>
                  <div className="text-sm font-medium text-text-primary">Share Progress Data</div>
                  <div className="text-xs text-text-secondary">Allow caregivers to view your progress</div>
                </div>
                <button
                  onClick={() => handlePrivacyChange('shareProgress', !privacySettings.shareProgress)}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                    ${privacySettings.shareProgress ? 'bg-primary' : 'bg-gray-200'}
                  `}
                  role="switch"
                  aria-checked={privacySettings.shareProgress}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${privacySettings.shareProgress ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg">
                <div>
                  <div className="text-sm font-medium text-text-primary">Share Routine Data</div>
                  <div className="text-xs text-text-secondary">Allow caregivers to view your routines</div>
                </div>
                <button
                  onClick={() => handlePrivacyChange('shareRoutines', !privacySettings.shareRoutines)}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                    ${privacySettings.shareRoutines ? 'bg-primary' : 'bg-gray-200'}
                  `}
                  role="switch"
                  aria-checked={privacySettings.shareRoutines}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${privacySettings.shareRoutines ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg">
                <div>
                  <div className="text-sm font-medium text-text-primary">Allow Messages</div>
                  <div className="text-xs text-text-secondary">Receive messages from caregivers</div>
                </div>
                <button
                  onClick={() => handlePrivacyChange('allowMessages', !privacySettings.allowMessages)}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                    ${privacySettings.allowMessages ? 'bg-primary' : 'bg-gray-200'}
                  `}
                  role="switch"
                  aria-checked={privacySettings.allowMessages}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${privacySettings.allowMessages ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Data Export */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-text-primary">Data Export</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {dataExportOptions.map((option) => (
                <div key={option.id} className="p-3 bg-surface-secondary rounded-lg border border-border">
                  <div className="text-sm font-medium text-text-primary mb-1">
                    {option.label}
                  </div>
                  <div className="text-xs text-text-secondary mb-3">
                    {option.description}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => exportData([option.id])}
                    iconName="Download"
                    iconPosition="left"
                    className="w-full"
                  >
                    Export
                  </Button>
                </div>
              ))}
            </div>
            
            <Button
              variant="primary"
              onClick={() => exportData(dataExportOptions.map(opt => opt.id))}
              iconName="Download"
              iconPosition="left"
              className="w-full"
            >
              Export All Data
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
                      <div className="text-sm font-medium text-error-800">
                        {resource.name}
                      </div>
                      <div className="text-sm text-error-700 font-mono">
                        {resource.contact}
                      </div>
                      <div className="text-xs text-error-600 mt-1">
                        {resource.description}
                      </div>
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
                  // Mock reset functionality
                  alert('Settings would be reset to defaults');
                }
              }}
              iconName="RotateCcw"
              iconPosition="left"
            >
              Reset All Settings
            </Button>
            
            <Button
              variant="danger"
              onClick={() => {
                if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                  // Mock delete account functionality
                  alert('Account deletion process would begin');
                }
              }}
              iconName="Trash2"
              iconPosition="left"
            >
              Delete Account
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSection;