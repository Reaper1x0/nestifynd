// utils/streakCalculator.js
const Streak = require('../models/Streak');
const moment = require('moment');

async function calculateStreak(userId) {
  const today = moment().startOf('day');
  const yesterday = moment(today).subtract(1, 'days');

  let streak = await Streak.findOne({ userId });

  if (!streak) {
    streak = new Streak({ userId });
  }

  if (!streak.lastCompletedDate) {
    streak.lastCompletedDate = today.toDate();
    streak.currentStreak = 1;
    streak.longestStreak = 1;
  } else {
    const lastCompleted = moment(streak.lastCompletedDate).startOf('day');

    if (lastCompleted.isSame(today, 'day')) {
      // Already logged today
      return streak;
    } else if (lastCompleted.isSame(yesterday, 'day') || streak.currentStreak === 0) {
      // Consecutive day
      streak.currentStreak += 1;
    } else {
      // Streak broken
      streak.currentStreak = 1;
    }

    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
    }

    streak.lastCompletedDate = today.toDate();
  }

  streak.updatedAt = new Date();
  await streak.save();

  return streak;
}

module.exports = calculateStreak;