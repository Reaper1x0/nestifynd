// utils/badgeUnlocker.js
const Badge = require('../models/Badge');
const Achievement = require('../models/Achievement');
const Task = require('../models/Task');
const Streak = require('../models/Streak');

async function unlockBadges(userId) {
  const [badges, userTasks, streak] = await Promise.all([
    Badge.find({}),
    Task.find({ user: userId }),
    Streak.findOne({ userId }).lean(),
  ]);

  const completedCount = userTasks.filter(t => t.completed).length;
  const snoozedCount = userTasks.filter(t => t.isSnoozed).length;
  const currentStreak = streak?.currentStreak ?? 0;

  const unlocked = [];

  for (const badge of badges) {
    const criteriaMet = evaluateCriteria(badge.criteria, completedCount, snoozedCount, currentStreak);

    if (criteriaMet) {
      const exists = await Achievement.findOne({ userId, badgeId: badge._id });
      if (!exists) {
        const achievement = new Achievement({ userId, badgeId: badge._id });
        await achievement.save();
        unlocked.push(badge);
      }
    }
  }

  return unlocked;
}

function evaluateCriteria(criteria, completed, snoozed, streak) {
  if (criteria.completedTasks && completed >= criteria.completedTasks) return true;
  if (criteria.snoozedTasks && snoozed >= criteria.snoozedTasks) return true;
  if (criteria.streakDays && streak >= criteria.streakDays) return true;
  return false;
}

module.exports = unlockBadges;