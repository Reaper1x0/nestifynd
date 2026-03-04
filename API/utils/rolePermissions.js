/**
 * Default permissions by role name. Used by seed and auth backfill.
 */
const defaultPermissionsByRole = {
  user: {
    canManageUsers: false, canViewAllUsers: false, canAssignUsers: false,
    canCreateRoutines: true, canEditRoutines: true, canDeleteRoutines: true, canSetActiveRoutine: true,
    canCreateTasks: true, canEditTasks: true, canDeleteTasks: true, canCompleteTasks: true, canSnoozeTasks: true, canDismissTasks: true,
    canViewReports: true, canDownloadReports: true, canViewAllReports: false,
    canReceiveNotifications: true, canSendNotifications: false, canUseAI: true, canGenerateRoutines: true,
    canManagePlans: false, canManageRoles: false, canManageSystem: false
  },
  admin: {
    canManageUsers: true, canViewAllUsers: true, canAssignUsers: true,
    canCreateRoutines: true, canEditRoutines: true, canDeleteRoutines: true, canSetActiveRoutine: true,
    canCreateTasks: true, canEditTasks: true, canDeleteTasks: true, canCompleteTasks: true, canSnoozeTasks: true, canDismissTasks: true,
    canViewReports: true, canDownloadReports: true, canViewAllReports: true,
    canReceiveNotifications: true, canSendNotifications: true, canUseAI: true, canGenerateRoutines: true,
    canManagePlans: true, canManageRoles: true, canManageSystem: true
  },
  therapist: {
    canManageUsers: false, canViewAllUsers: true, canAssignUsers: true,
    canCreateRoutines: true, canEditRoutines: true, canDeleteRoutines: false, canSetActiveRoutine: true,
    canCreateTasks: true, canEditTasks: true, canDeleteTasks: false, canCompleteTasks: false, canSnoozeTasks: false, canDismissTasks: false,
    canViewReports: true, canDownloadReports: true, canViewAllReports: false,
    canReceiveNotifications: true, canSendNotifications: true, canUseAI: true, canGenerateRoutines: true,
    canManagePlans: false, canManageRoles: false, canManageSystem: false
  },
  caregiver: {
    canManageUsers: false, canViewAllUsers: false, canAssignUsers: false,
    canCreateRoutines: false, canEditRoutines: false, canDeleteRoutines: false, canSetActiveRoutine: false,
    canCreateTasks: false, canEditTasks: false, canDeleteTasks: false, canCompleteTasks: false, canSnoozeTasks: false, canDismissTasks: false,
    canViewReports: false, canDownloadReports: false, canViewAllReports: false,
    canReceiveNotifications: true, canSendNotifications: false, canUseAI: false, canGenerateRoutines: false,
    canManagePlans: false, canManageRoles: false, canManageSystem: false
  }
};

function hasPermissions(role) {
  if (!role || typeof role.permissions !== 'object') return false;
  const keys = Object.keys(role.permissions);
  return keys.length > 0 && keys.some(k => role.permissions[k] === true);
}

function getDefaultPermissionsForRole(roleName) {
  const name = (roleName || 'user').toLowerCase();
  return defaultPermissionsByRole[name] || defaultPermissionsByRole.user;
}

module.exports = {
  defaultPermissionsByRole,
  hasPermissions,
  getDefaultPermissionsForRole
};
