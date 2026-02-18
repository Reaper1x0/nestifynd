const Role = require('../models/Role');

const seedRoles = async () => {
  const roles = [
    {
      name: 'admin',
      displayName: 'Administrator',
      description: 'Full system access with all permissions',
      isDefault: false
    },
    {
      name: 'user',
      displayName: 'User',
      description: 'Standard user with basic permissions',
      isDefault: true
    },
    {
      name: 'therapist',
      displayName: 'Therapist',
      description: 'Healthcare professional with patient management access',
      isDefault: false
    },
    {
      name: 'caregiver',
      displayName: 'Caregiver',
      description: 'Family member or caregiver with limited access',
      isDefault: false
    }
  ];

  // Clear existing roles
  await Role.deleteMany({});
  
  // Insert new roles
  await Role.insertMany(roles);
  console.log('Roles seeded successfully');
};

module.exports = seedRoles;
