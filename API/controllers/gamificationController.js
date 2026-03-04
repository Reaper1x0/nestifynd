// controllers/gamificationController.js
const mongoose = require('mongoose');
const Streak = require('../models/Streak');
const Achievement = require('../models/Achievement');
const Badge = require('../models/Badge');
const Task = require('../models/Task');
const UserActivity = require('../models/UserActivity');
const RewardRedemption = require('../models/RewardRedemption');
const Challenge = require('../models/Challenge');
const moment = require('moment');
const calculateStreak = require('../utils/streakCalculator');
const unlockBadges = require('../utils/badgeUnlocker');

const POINTS_PER_TASK = 10;
const POINTS_PER_BADGE = 50;

exports.getUserStats = async (req, res) => {
  const userId = req.user._id;

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
  const userId = req.user._id;

  try {
    const task = await Task.findById(taskId);
    if (!task || !task.user.equals(userId)) {
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

/**
 * Build progress data for a given userId (shared by getProgress and therapist getClientProgress)
 * @param {ObjectId|string} userId - User ID
 * @param {{ range?: '7d'|'30d'|'90d' }} options - range: 7d=this week, 30d=last 30 days, 90d=last 90 days
 */
async function buildProgressForUser(userId, options = {}) {
  const uid = mongoose.Types.ObjectId.isValid(userId)
    ? (typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId)
    : userId;
  const range = options.range || '7d';
  let startDate;
  let numDays;
  if (range === '30d') {
    startDate = moment().subtract(30, 'days').startOf('day');
    numDays = 30;
  } else if (range === '90d') {
    startDate = moment().subtract(90, 'days').startOf('day');
    numDays = 90;
  } else {
    startDate = moment().startOf('isoWeek');
    numDays = 7;
  }
  const startDateObj = startDate.toDate();

  const [
    streak,
    achievements,
    allBadges,
    taskCompletions,
    totalTasksInRoutines,
    activities,
    weeklyByDay,
    spentResult,
    categoryAgg
  ] = await Promise.all([
    Streak.findOne({ userId: uid }).lean(),
    Achievement.find({ userId: uid }).populate('badgeId', 'name description icon criteria').sort({ earnedAt: -1 }).lean(),
    Badge.find({}).lean(),
    UserActivity.countDocuments({ user: uid, type: 'task_completed' }),
    Task.countDocuments({ user: uid }),
    UserActivity.find({ user: uid, type: 'task_completed', createdAt: { $gte: startDateObj } }).sort({ createdAt: -1 }).limit(range === '7d' ? 20 : 500).populate('relatedTask', 'name routine').lean(),
    UserActivity.aggregate([
      { $match: { user: uid, type: 'task_completed', createdAt: { $gte: startDateObj } } },
      { $group: { _id: { $dayOfWeek: '$createdAt' }, count: { $sum: 1 } } }
    ]),
    RewardRedemption.aggregate([{ $match: { user: uid } }, { $group: { _id: null, total: { $sum: '$cost' } } }]),
    UserActivity.aggregate([
      { $match: { user: uid, type: 'task_completed', $or: [{ relatedTask: { $ne: null } }, { relatedRoutine: { $ne: null } }] } },
      { $lookup: { from: 'routines', localField: 'relatedRoutine', foreignField: '_id', as: 'rFromRoutine' } },
      { $lookup: { from: 'tasks', localField: 'relatedTask', foreignField: '_id', as: 'task' } },
      { $unwind: { path: '$task', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'routines', localField: 'task.routine', foreignField: '_id', as: 'rFromTask' } },
      { $unwind: { path: '$rFromTask', preserveNullAndEmptyArrays: true } },
      { $addFields: { routineTitle: { $ifNull: [{ $let: { vars: { r: { $arrayElemAt: ['$rFromRoutine', 0] } }, in: '$$r.title' } }, { $let: { vars: { r: { $arrayElemAt: ['$rFromTask', 0] } }, in: '$$r.title' } }] } } },
      { $match: { routineTitle: { $ne: null, $ne: '' } } },
      { $group: { _id: '$routineTitle', count: { $sum: 1 } } },
      { $project: { name: '$_id', value: '$count', _id: 0 } }
    ])
  ]);

  const streakData = streak || { currentStreak: 0, longestStreak: 0 };
  const totalPoints = taskCompletions * POINTS_PER_TASK + achievements.length * POINTS_PER_BADGE;
  const spentPoints = spentResult[0]?.total || 0;
  const availablePoints = Math.max(0, totalPoints - spentPoints);

  let weeklyChartData;
  if (range === '7d') {
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const mongoDowForIndex = [2, 3, 4, 5, 6, 7, 1];
    const totalInPeriod = (weeklyByDay || []).reduce((s, d) => s + (d.count || 0), 0);
    const expectedTotal = Math.max(totalTasksInRoutines || 1, totalInPeriod || 1);
    weeklyChartData = dayLabels.map((day, i) => {
      const mongoDow = mongoDowForIndex[i];
      const found = weeklyByDay.find(d => d._id === mongoDow);
      const completed = found ? found.count : 0;
      return { day, completed, total: expectedTotal };
    });
  } else {
    const byWeek = {};
    (activities || []).forEach(a => {
      if (a.createdAt) {
        const m = moment(a.createdAt);
        const key = `${m.isoWeekYear()}-${String(m.isoWeek()).padStart(2, '0')}`;
        byWeek[key] = (byWeek[key] || 0) + 1;
      }
    });
    const numWeeks = Math.min(range === '30d' ? 4 : 12, Math.ceil(numDays / 7));
    weeklyChartData = [];
    const totalInPeriod = Object.values(byWeek).reduce((s, c) => s + c, 0);
    for (let w = 0; w < numWeeks; w++) {
      const weekStart = moment(startDate).add(w, 'weeks');
      const weekEnd = weekStart.clone().add(6, 'days');
      const key = `${weekStart.isoWeekYear()}-${String(weekStart.isoWeek()).padStart(2, '0')}`;
      const completed = byWeek[key] || 0;
      weeklyChartData.push({
        day: `W${w + 1}`,
        label: weekStart.format('MMM D') + '-' + weekEnd.format('MMM D'),
        completed,
        total: Math.max(1, totalInPeriod || 1)
      });
    }
  }

  const streakCalendar = {};
  for (const a of activities) {
    if (a.createdAt) {
      const d = moment(a.createdAt).format('YYYY-MM-DD');
      streakCalendar[d] = streakCalendar[d] ? 'complete' : 'complete';
    }
  }

  const recentEarnings = activities.slice(0, 10).map(a => ({
    activity: a.action || 'Task completed',
    description: a.details || '',
    points: POINTS_PER_TASK,
    icon: 'CheckCircle',
    timestamp: a.createdAt ? moment(a.createdAt).fromNow() : ''
  }));

  const recentAchievements = achievements.slice(0, 5).map(a => ({
    id: a._id,
    title: a.badgeId?.name || 'Achievement',
    description: a.badgeId?.description || '',
    icon: a.badgeId?.icon || 'Award',
    points: POINTS_PER_BADGE,
    earnedDate: a.earnedAt ? moment(a.earnedAt).format('MMMM D, YYYY') : null,
    isEarned: true
  }));

  const badgeCollection = allBadges.map(b => {
    const earned = achievements.find(a => a.badgeId && String(a.badgeId._id) === String(b._id));
    const criteria = b.criteria || {};
    const requirements = [];
    if (criteria.completedTasks) requirements.push(`Complete ${criteria.completedTasks} task${criteria.completedTasks > 1 ? 's' : ''} total`);
    if (criteria.streakDays) requirements.push(`Complete tasks ${criteria.streakDays} days in a row`);
    if (criteria.snoozedTasks) requirements.push(`Use snooze ${criteria.snoozedTasks} time${criteria.snoozedTasks > 1 ? 's' : ''}`);
    if (requirements.length === 0) requirements.push(b.description);
    return {
      id: b._id,
      title: b.name,
      description: b.description,
      icon: b.icon || 'Award',
      category: criteria.completedTasks ? 'completion' : criteria.streakDays ? 'streak' : criteria.snoozedTasks ? 'special' : 'milestone',
      points: POINTS_PER_BADGE,
      requirements,
      isEarned: !!earned,
      earnedAt: earned?.earnedAt || null
    };
  });

  const newAchievementsCount = achievements.filter(a => {
    const earned = a.earnedAt ? moment(a.earnedAt) : null;
    return earned && earned.isAfter(moment().subtract(7, 'days'));
  }).length;

  const categoryData = (categoryAgg || []).filter(c => c.name).map(c => ({ name: c.name, value: c.value }));

  let challenges = [];
  try {
    challenges = await Challenge.find({ isActive: true }).lean();
  } catch (e) {
    // Challenge collection may not exist before seeding
  }

  return {
    points: availablePoints,
    totalPointsEarned: totalPoints,
    streak: { currentStreak: streakData.currentStreak || 0, longestStreak: streakData.longestStreak || 0 },
    streakCalendar,
    weeklyChartData,
    range,
    recentEarnings,
    recentAchievements,
    badges: badgeCollection,
    totalBadges: achievements.length,
    earnedBadgesCount: achievements.length,
    newAchievementsCount,
    challenges: challenges.map(c => ({
      id: c._id,
      title: c.title,
      description: c.description,
      icon: c.icon || 'Target',
      difficulty: c.difficulty || 'medium',
      duration: c.duration || '7 days',
      reward: c.rewardPoints || 100,
      participants: c.participantCount || 0,
      requirements: c.requirements || [],
      isNew: false
    })),
    categoryData
  };
}

exports.buildProgressForUser = buildProgressForUser;

/**
 * GET /api/gamification/progress
 * Returns full progress data for Gamification Hub
 */
exports.getProgress = async (req, res) => {
  try {
    const data = await buildProgressForUser(req.user._id);
    res.json({
      ...data,
      availableRewards: [
        { id: 'custom_theme', title: 'Custom Theme', description: 'Unlock a personalized color theme', icon: 'Palette', cost: 200, availability: 'permanent' },
        { id: 'extra_reminders', title: 'Extra Reminders', description: 'Additional reminder notifications', icon: 'Bell', cost: 150, availability: 'permanent' },
        { id: 'progress_report', title: 'Detailed Progress Report', description: 'Weekly progress analysis', icon: 'FileText', cost: 300, availability: 'limited' },
        { id: 'virtual_celebration', title: 'Virtual Celebration', description: 'Special animations for achievements', icon: 'Sparkles', cost: 100, availability: 'permanent' }
      ]
    });
  } catch (error) {
    console.error('Progress API error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/gamification/rewards/redeem
 * Redeem a reward for points
 */
exports.redeemReward = async (req, res) => {
  try {
    const userId = req.user._id;
    const { rewardId, rewardTitle, cost } = req.body;

    if (!rewardId || !rewardTitle || typeof cost !== 'number' || cost < 0) {
      return res.status(400).json({ message: 'Invalid reward data' });
    }

    const [
      taskCompletions,
      achievements,
      spentResult
    ] = await Promise.all([
      UserActivity.countDocuments({ user: userId, type: 'task_completed' }),
      Achievement.countDocuments({ userId }),
      RewardRedemption.aggregate([{ $match: { user: userId } }, { $group: { _id: null, total: { $sum: '$cost' } } }])
    ]);

    const totalPoints = taskCompletions * POINTS_PER_TASK + achievements * POINTS_PER_BADGE;
    const spentPoints = spentResult[0]?.total || 0;
    const availablePoints = Math.max(0, totalPoints - spentPoints);

    if (availablePoints < cost) {
      return res.status(400).json({ message: 'Not enough points to redeem this reward' });
    }

    await RewardRedemption.create({
      user: userId,
      rewardId,
      rewardTitle,
      cost
    });

    res.json({
      message: 'Reward redeemed successfully',
      reward: { id: rewardId, title: rewardTitle, cost },
      remainingPoints: availablePoints - cost
    });
  } catch (error) {
    console.error('Redeem reward error:', error);
    res.status(500).json({ error: error.message });
  }
};