
const Plan = require('../models/Plan');

const seedPlans = async () => {
  const plans = [
    {
      name: 'Free',
      price: 0,
      interval: 'month',
      features: ['Limited routines', 'Basic reminders']
    },
    {
      name: 'Pro',
      price: 9.99,
      interval: 'month',
      features: ['Unlimited routines', 'AI assistant', 'Therapist features']
    },
    {
      name: 'Family',
      price: 14.99,
      interval: 'month',
      features: ['Shared care access', 'Team reports', 'All Pro features']
    }
  ];

  await Plan.deleteMany({});
  await Plan.insertMany(plans);
  console.log('Plans seeded');
};

module.exports = seedPlans;
