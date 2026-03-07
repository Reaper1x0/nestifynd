// controllers/dashboardController.js
const Task = require('../models/Task');
const Routine = require('../models/Routine');
const Streak = require('../models/Streak');
const Achievement = require('../models/Achievement');
const UserActivity = require('../models/UserActivity');
const moment = require('moment');

/**
 * GET /api/dashboard/stats
 * Returns real stats for Quick Stats, charts, and recent achievements
 */
exports.getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const now = moment();
    const startOfThisWeek = moment().startOf('isoWeek'); // Monday
    const startOfLastWeek = moment().subtract(1, 'week').startOf('isoWeek');
    const endOfLastWeek = moment(startOfLastWeek).endOf('isoWeek');

    const [
      allTasks,
      routines,
      streak,
      achievements,
      completionsThisWeek,
      completionsLastWeek,
      weeklyCompletionsByDay
    ] = await Promise.all([
      Task.find({ user: userId }).select('completed completedAt isDismissed'),
      Routine.find({ user: userId }).countDocuments(),
      Streak.findOne({ userId }).lean(),
      Achievement.find({ userId }).populate('badgeId', 'name icon').sort({ earnedAt: -1 }).lean(),
      UserActivity.countDocuments({ user: userId, type: 'task_completed', createdAt: { $gte: startOfThisWeek.toDate() } }),
      UserActivity.countDocuments({ user: userId, type: 'task_completed', createdAt: { $gte: startOfLastWeek.toDate(), $lte: endOfLastWeek.toDate() } }),
      UserActivity.aggregate([
        { $match: { user: userId, type: 'task_completed', createdAt: { $gte: startOfThisWeek.toDate() } } },
        { $group: { _id: { $dayOfWeek: '$createdAt' }, count: { $sum: 1 } } }
      ])
    ]);

    const completedTasks = allTasks.filter(t => t.completed && !t.isDismissed).length;
    const pendingTasks = allTasks.filter(t => !t.completed && !t.isDismissed).length;
    const totalTasks = completedTasks + pendingTasks;
    const overallCompletedPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const overallPendingPct = totalTasks > 0 ? 100 - overallCompletedPct : 0;

    const totalTasksForWeekly = allTasks.length;
    const weeklyCompletionPct = totalTasksForWeekly > 0
      ? Math.min(100, Math.round((completionsThisWeek / totalTasksForWeekly) * 100))
      : (completionsThisWeek > 0 ? 100 : 0);

    const lastWeekTotal = totalTasksForWeekly;
    const weeklyCompletionLastPct = lastWeekTotal > 0
      ? Math.min(100, Math.round((completionsLastWeek / lastWeekTotal) * 100))
      : 0;
    const weeklyChange = weeklyCompletionPct - weeklyCompletionLastPct;
    const weeklyChangeStr = weeklyChange > 0 ? `+${weeklyChange}%` : weeklyChange < 0 ? `${weeklyChange}%` : '0%';

    // MongoDB $dayOfWeek: 1=Sun, 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri, 7=Sat
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const mongoDowForIndex = [2, 3, 4, 5, 6, 7, 1];
    const weeklyChartData = dayLabels.map((day, i) => {
      const mongoDow = mongoDowForIndex[i];
      const found = weeklyCompletionsByDay.find(d => d._id === mongoDow);
      return {
        day,
        completed: found ? found.count : 0,
        total: totalTasksForWeekly || 1
      };
    });

    const streakData = streak || { currentStreak: 0, longestStreak: 0 };
    const activeRoutinesCount = await Routine.countDocuments({ user: userId, isActive: true });

    res.json({
      weeklyCompletion: weeklyCompletionPct,
      weeklyCompletionChange: weeklyChangeStr,
      streak: { currentStreak: streakData.currentStreak || 0, longestStreak: streakData.longestStreak || 0 },
      totalRoutines: routines,
      activeRoutinesCount,
      totalBadges: achievements.length,
      badges: achievements.map(a => a.badgeId).filter(Boolean),
      recentBadges: achievements
        .filter(a => a.badgeId)
        .slice(0, 3)
        .map(a => ({ name: a.badgeId.name, icon: a.badgeId.icon || 'Award' })),
      weeklyChartData,
      overallCompletion: {
        completed: overallCompletedPct,
        pending: overallPendingPct
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: error.message });
  }
};
