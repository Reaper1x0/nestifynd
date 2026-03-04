const Challenge = require('../models/Challenge');

const challenges = [
  {
    title: 'Mindful March',
    description: 'Complete meditation or mindfulness tasks every day this week',
    icon: 'Brain',
    difficulty: 'medium',
    duration: '7 days',
    rewardPoints: 150,
    requirements: [
      'Complete at least one mindfulness task daily',
      'Tasks must be at least 5 minutes long',
      'Track your progress each day'
    ]
  },
  {
    title: 'Morning Momentum',
    description: 'Start your day strong with consistent morning routines',
    icon: 'Sunrise',
    difficulty: 'easy',
    duration: '7 days',
    rewardPoints: 100,
    requirements: [
      'Complete morning routine before 10 AM',
      'Include at least 3 different activities',
      'No more than 2 missed days allowed'
    ]
  },
  {
    title: 'Streak Starter',
    description: 'Complete at least one task for 3 consecutive days',
    icon: 'Flame',
    difficulty: 'easy',
    duration: '3 days',
    rewardPoints: 75,
    requirements: [
      'Complete at least one task each day',
      'Must be 3 days in a row',
      'Any routine or task counts'
    ]
  },
  {
    title: 'Consistency Champion',
    description: 'Maintain 80% completion rate for all your routines',
    icon: 'Target',
    difficulty: 'hard',
    duration: '7 days',
    rewardPoints: 200,
    requirements: [
      'Achieve 80% or higher completion rate',
      'Apply to all active routines',
      'No breaks longer than 1 day'
    ]
  },
  {
    title: 'Week Warrior',
    description: 'Complete all daily routines for a full week',
    icon: 'Calendar',
    difficulty: 'medium',
    duration: '7 days',
    rewardPoints: 175,
    requirements: [
      'Complete all tasks in your routines',
      'Do this for 7 days straight',
      'Keep your streak going'
    ]
  }
];

module.exports = async function seedChallenges() {
  for (const c of challenges) {
    await Challenge.findOneAndUpdate(
      { title: c.title },
      { $set: { ...c, isActive: true } },
      { upsert: true }
    );
  }
  console.log('Challenges seeded successfully');
};
