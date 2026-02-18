// utils/badgeUnlocker.js
const Badge = require('../models/Badge');
const Achievement = require('../models/Achievement');
const Task = require('../models/Task');

async function unlockBadges(userId) {
  const badges = await Badge.find({});
  const userTasks = await Task.find({ userId });

  const completedCount = userTasks.filter(t => t.completed).length;
  const snoozedCount = userTasks.reduce((sum, t) => sum + t.snoozedCount, 0);

  const unlocked = [];

  for (const badge of badges) {
    const criteriaMet = evaluateCriteria(badge.criteria, completedCount, snoozedCount);

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

function evaluateCriteria(criteria, completed, snoozed) {
  if (criteria.completedTasks && completed >= criteria.completedTasks) return true;
  if (criteria.snoozedTasks && snoozed >= criteria.snoozedTasks) return true;
  return false;
}

module.exports = unlockBadges;