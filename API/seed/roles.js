const Role = require('../models/Role');
const { defaultPermissionsByRole } = require('../utils/rolePermissions');

const seedRoles = async () => {
  const roles = [
    { name: 'admin', displayName: 'Administrator', description: 'Full system access with all permissions', isDefault: false },
    { name: 'user', displayName: 'User', description: 'Standard user with basic permissions', isDefault: true },
    { name: 'therapist', displayName: 'Therapist', description: 'Healthcare professional with patient management access', isDefault: false },
    { name: 'caregiver', displayName: 'Caregiver', description: 'Family member or caregiver with limited access', isDefault: false }
  ];

  for (const r of roles) {
    const perms = defaultPermissionsByRole[r.name] || defaultPermissionsByRole.user;
    await Role.findOneAndUpdate(
      { name: r.name },
      { ...r, permissions: perms },
      { upsert: true, new: true }
    );
  }
  console.log('Roles seeded successfully');
};

module.exports = seedRoles;
