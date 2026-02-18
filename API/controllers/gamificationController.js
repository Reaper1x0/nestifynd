// controllers/gamificationController.js
const Streak = require('../models/Streak');
const Achievement = require('../models/Achievement');
const Badge = require('../models/Badge');
const Task = require('../models/Task');
const calculateStreak = require('../utils/streakCalculator');
const unlockBadges = require('../utils/badgeUnlocker');

exports.getUserStats = async (req, res) => {
  const userId = req.user.id;

  try {
    const [streak, achievements] = await Promise.all([
      Streak.findOne({ userId }),
      Achievement.find({ userId }).populate('badgeId')
    ]);

    res.json({
      streak: streak || { currentStreak: 0, longestStreak: 0 },
      badges: achievements.map(a => a.badgeId),
      totalBadges: achievements.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
};

exports.checkTaskCompletion = async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user.id;

  try {
    const task = await Task.findById(taskId);
    if (!task || task.userId.toString() !== userId) {
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }

    if (!task.completed) {
      return res.status(400).json({ message: 'Task is not marked as completed' });
    }

    const streak = await calculateStreak(userId);
    const unlockedBadges = await unlockBadges(userId);

    res.json({
      streak,
      unlockedBadges
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error checking task' });
  }
};