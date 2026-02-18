const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    unique: true,
    enum: ['admin', 'user', 'therapist', 'caregiver'],
    lowercase: true
  },
  displayName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  permissions: {
    // User management
    canManageUsers: {
      type: Boolean,
      default: false
    },
    canViewAllUsers: {
      type: Boolean,
      default: false
    },
    canAssignUsers: {
      type: Boolean,
      default: false
    },
    
    // Routine management
    canCreateRoutines: {
      type: Boolean,
      default: true
    },
    canEditRoutines: {
      type: Boolean,
      default: true
    },
    canDeleteRoutines: {
      type: Boolean,
      default: true
    },
    canSetActiveRoutine: {
      type: Boolean,
      default: true
    },
    
    // Task management
    canCreateTasks: {
      type: Boolean,
      default: true
    },
    canEditTasks: {
      type: Boolean,
      default: true
    },
    canDeleteTasks: {
      type: Boolean,
      default: true
    },
    canCompleteTasks: {
      type: Boolean,
      default: true
    },
    canSnoozeTasks: {
      type: Boolean,
      default: true
    },
    canDismissTasks: {
      type: Boolean,
      default: true
    },
    
    // Reports and analytics
    canViewReports: {
      type: Boolean,
      default: false
    },
    canDownloadReports: {
      type: Boolean,
      default: false
    },
    canViewAllReports: {
      type: Boolean,
      default: false
    },
    
    // Notifications
    canReceiveNotifications: {
      type: Boolean,
      default: true
    },
    canSendNotifications: {
      type: Boolean,
      default: false
    },
    
    // AI features
    canUseAI: {
      type: Boolean,
      default: true
    },
    canGenerateRoutines: {
      type: Boolean,
      default: true
    },
    
    // Admin features
    canManagePlans: {
      type: Boolean,
      default: false
    },
    canManageRoles: {
      type: Boolean,
      default: false
    },
    canManageSystem: {
      type: Boolean,
      default: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

// Indexes
roleSchema.index({ name: 1 });
roleSchema.index({ isActive: 1 });

// Method to check if role has specific permission
roleSchema.methods.hasPermission = function(permission) {
  return this.permissions[permission] === true;
};

// Method to check if role has any of the given permissions
roleSchema.methods.hasAnyPermission = function(permissions) {
  return permissions.some(permission => this.hasPermission(permission));
};

// Method to check if role has all of the given permissions
roleSchema.methods.hasAllPermissions = function(permissions) {
  return permissions.every(permission => this.hasPermission(permission));
};

// Static method to get role by name
roleSchema.statics.getByName = function(name) {
  return this.findOne({ name: name.toLowerCase() });
};

// Static method to get default role
roleSchema.statics.getDefault = function() {
  return this.findOne({ isDefault: true });
};

// Pre-save middleware to set default permissions based on role
roleSchema.pre('save', function(next) {
  if (this.isNew) {
    switch (this.name) {
      case 'admin':
        this.permissions = {
          canManageUsers: true,
          canViewAllUsers: true,
          canAssignUsers: true,
          canCreateRoutines: true,
          canEditRoutines: true,
          canDeleteRoutines: true,
          canSetActiveRoutine: true,
          canCreateTasks: true,
          canEditTasks: true,
          canDeleteTasks: true,
          canCompleteTasks: true,
          canSnoozeTasks: true,
          canDismissTasks: true,
          canViewReports: true,
          canDownloadReports: true,
          canViewAllReports: true,
          canReceiveNotifications: true,
          canSendNotifications: true,
          canUseAI: true,
          canGenerateRoutines: true,
          canManagePlans: true,
          canManageRoles: true,
          canManageSystem: true
        };
        break;
      case 'therapist':
        this.permissions = {
          canManageUsers: false,
          canViewAllUsers: true,
          canAssignUsers: true,
          canCreateRoutines: true,
          canEditRoutines: true,
          canDeleteRoutines: false,
          canSetActiveRoutine: true,
          canCreateTasks: true,
          canEditTasks: true,
          canDeleteTasks: false,
          canCompleteTasks: false,
          canSnoozeTasks: false,
          canDismissTasks: false,
          canViewReports: true,
          canDownloadReports: true,
          canViewAllReports: false,
          canReceiveNotifications: true,
          canSendNotifications: true,
          canUseAI: true,
          canGenerateRoutines: true,
          canManagePlans: false,
          canManageRoles: false,
          canManageSystem: false
        };
        break;
      case 'caregiver':
        this.permissions = {
          canManageUsers: false,
          canViewAllUsers: false,
          canAssignUsers: false,
          canCreateRoutines: false,
          canEditRoutines: false,
          canDeleteRoutines: false,
          canSetActiveRoutine: false,
          canCreateTasks: false,
          canEditTasks: false,
          canDeleteTasks: false,
          canCompleteTasks: false,
          canSnoozeTasks: false,
          canDismissTasks: false,
          canViewReports: false,
          canDownloadReports: false,
          canViewAllReports: false,
          canReceiveNotifications: true,
          canSendNotifications: false,
          canUseAI: false,
          canGenerateRoutines: false,
          canManagePlans: false,
          canManageRoles: false,
          canManageSystem: false
        };
        break;
      case 'user':
      default:
        this.permissions = {
          canManageUsers: false,
          canViewAllUsers: false,
          canAssignUsers: false,
          canCreateRoutines: true,
          canEditRoutines: true,
          canDeleteRoutines: true,
          canSetActiveRoutine: true,
          canCreateTasks: true,
          canEditTasks: true,
          canDeleteTasks: true,
          canCompleteTasks: true,
          canSnoozeTasks: true,
          canDismissTasks: true,
          canViewReports: true,
          canDownloadReports: true,
          canViewAllReports: false,
          canReceiveNotifications: true,
          canSendNotifications: false,
          canUseAI: true,
          canGenerateRoutines: true,
          canManagePlans: false,
          canManageRoles: false,
          canManageSystem: false
        };
        break;
    }
  }
  next();
});

module.exports = mongoose.model('Role', roleSchema);
