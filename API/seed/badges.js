const Badge = require('../models/Badge');

const badges = [
  { name: 'First Steps', description: 'Complete your first task', criteria: { completedTasks: 1 }, icon: 'Circle' },
  { name: 'Task Crusher', description: 'Complete 10 tasks total', criteria: { completedTasks: 10 }, icon: 'CheckCircle' },
  { name: 'Century Club', description: 'Complete 100 tasks total', criteria: { completedTasks: 100 }, icon: 'Award' },
  { name: 'Streak Starter', description: 'Complete tasks 3 days in a row', criteria: { streakDays: 3 }, icon: 'Flame' },
  { name: 'Week Warrior', description: 'Complete all routines for a full week', criteria: { streakDays: 7 }, icon: 'Calendar' },
  { name: 'Snooze Master', description: 'Use snooze 5 times', criteria: { snoozedTasks: 5 }, icon: 'Clock' },
];

module.exports = async function seedBadges() {
  for (const b of badges) {
    await Badge.findOneAndUpdate(
      { name: b.name },
      { $set: b },
      { upsert: true }
    );
  }
};
