const Plan = require('../models/Plan');
const User = require('../models/User');

const seedPlans = async () => {
  const plans = [
    {
      name: 'Free',
      price: 0,
      interval: 'month',
      isActive: true,
      features: ['1 routine', '5 tasks per routine', 'Basic reminders'],
      limits: {
        therapist: { allowed: false, maxAllowed: 0 },
        caregiver: { allowed: false, maxAllowed: 0 },
        allowAIRoutine: false,
        allowAIChat: false,
        routines: 1,
        tasksPerRoutine: 5
      },
      customization: {
        allowColorChanges: false,
        allowThemeChanges: true
      }
    },
    {
      name: 'Basic',
      price: 9.99,
      interval: 'month',
      isActive: true,
      features: ['3 routines', '15 tasks per routine', '1 therapist', 'AI assistant'],
      limits: {
        therapist: { allowed: true, maxAllowed: 1 },
        caregiver: { allowed: false, maxAllowed: 0 },
        allowAIRoutine: false,
        allowAIChat: true,
        routines: 3,
        tasksPerRoutine: 15
      },
      customization: {
        allowColorChanges: false,
        allowThemeChanges: true
      }
    },
    {
      name: 'Premium',
      price: 14.99,
      interval: 'month',
      isActive: true,
      features: ['Unlimited routines', '50 tasks per routine', '1 therapist', '1 caregiver', 'AI Routine', 'AI assistant', 'Color customization', 'Theme customization'],
      limits: {
        therapist: { allowed: true, maxAllowed: 1 },
        caregiver: { allowed: true, maxAllowed: 1 },
        allowAIRoutine: true,
        allowAIChat: true,
        routines: 999,
        tasksPerRoutine: 50
      },
      customization: {
        allowColorChanges: true,
        allowThemeChanges: true
      }
    }
  ];

  const count = await Plan.countDocuments();
  if (count > 0) {
    // Plans already exist - do not overwrite admin edits
    return;
  }

  const inserted = await Plan.insertMany(plans);
  const validPlanIds = inserted.map((p) => p._id);
  const freePlan = inserted.find((p) => p.name === 'Free');
  const migrated = await User.updateMany(
    { plan: { $nin: validPlanIds } },
    { $set: { plan: freePlan._id } }
  );
  if (migrated.modifiedCount > 0) {
    console.log(`Plans seeded: Free, Basic, Premium. Migrated ${migrated.modifiedCount} users to Free plan.`);
  } else {
    console.log('Plans seeded: Free, Basic, Premium');
  }
};

module.exports = seedPlans;
