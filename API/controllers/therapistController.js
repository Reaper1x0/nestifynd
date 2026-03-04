// controllers/therapistController.js
const User = require('../models/User');
const Streak = require('../models/Streak');
const Achievement = require('../models/Achievement');
const UserAssignment = require('../models/UserAssignment');
const UserActivity = require('../models/UserActivity');
const Task = require('../models/Task');
const Routine = require('../models/Routine');
const Message = require('../models/Message');
const { buildProgressForUser } = require('./gamificationController');

exports.getClientReports = async (req, res) => {
  const therapistId = req.user._id;

  try {
    const assignments = await UserAssignment.find({
      relatedUserId: therapistId,
      relationshipType: { $in: ['therapist', 'caregiver'] },
      isActive: true
    }).populate('userId', 'name email lastLogin');

    const reports = [];

    for (const assignment of assignments) {
      const client = assignment.userId;
      if (!client) continue;

      const streak = await Streak.findOne({ userId: client._id });
      const achievements = await Achievement.find({ userId: client._id }).populate('badgeId');

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const activities = await UserActivity.find({
        user: client._id,
        createdAt: { $gte: oneWeekAgo }
      });
      const completedCount = activities.filter(a => a.type === 'task_completed').length;
      const tasksInPeriod = await Task.find({
        user: client._id,
        updatedAt: { $gte: oneWeekAgo }
      });
      const totalTasks = tasksInPeriod.length;
      const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
      const missedRoutines = activities.filter(a => a.type === 'reminder_sent').length;
      const lastCompleted = activities.find(a => a.type === 'task_completed');
      const latestActivity = await UserActivity.findOne({ user: client._id })
        .sort({ createdAt: -1 })
        .limit(1)
        .select('createdAt')
        .lean();
      const lastActivityDate = latestActivity?.createdAt || lastCompleted?.createdAt || client.lastLogin;

      const unreadMessages = await Message.countDocuments({
        senderId: client._id,
        receiverId: therapistId,
        read: false
      });

      reports.push({
        clientId: client._id,
        name: client.name || client.email,
        lastLogin: client.lastLogin,
        lastActivity: lastActivityDate,
        streak: streak ? streak.currentStreak : 0,
        longestStreak: streak ? streak.longestStreak : 0,
        badgesEarned: achievements.length,
        recentBadges: (achievements.slice(-3).map(a => a.badgeId && a.badgeId.name)).filter(Boolean),
        lastCompletedTask: null,
        completionRate,
        missedRoutines,
        unreadMessages,
        status: completionRate >= 80 ? 'excellent' : completionRate >= 50 ? 'active' : 'needs-attention'
      });
    }

    res.json({ reports });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching reports' });
  }
};

// GET /api/therapists/lookup-client?email=...
exports.lookupClientByEmail = async (req, res) => {
  try {
    const rawEmail = req.query.email;
    if (!rawEmail || typeof rawEmail !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }
    const email = rawEmail.trim().toLowerCase();
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email }).populate('role');
    if (!user) {
      return res.status(404).json({
        error: 'No user found with that email. The user must be registered in NestifyND with a standard user account.'
      });
    }

    const roleName = user.role?.name;
    if (!roleName || roleName !== 'user') {
      return res.status(400).json({
        error: roleName === 'therapist' || roleName === 'caregiver'
          ? `That email belongs to a ${roleName} account. Only regular users can be added as clients.`
          : 'That account cannot be added as a client. Only users with a standard account can be added.'
      });
    }

    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (error) {
    console.error('lookupClientByEmail error:', error);
    res.status(500).json({ error: error.message || 'Error looking up user' });
  }
};

// POST /api/therapists/clients — therapist adds a client
exports.addClient = async (req, res) => {
  try {
    const therapistId = req.user._id;
    const { userId: clientId } = req.body;
    if (!clientId) return res.status(400).json({ error: 'User ID (client) is required' });

    const client = await User.findById(clientId).populate('role');
    if (!client) return res.status(404).json({ error: 'User not found' });
    if (client.role?.name !== 'user') {
      return res.status(400).json({ error: 'Can only add regular users as clients' });
    }

    const existing = await UserAssignment.findOne({
      userId: clientId,
      relatedUserId: therapistId,
      relationshipType: 'therapist',
      isActive: true
    });
    if (existing) {
      return res.status(400).json({ error: 'This user is already your client' });
    }

    const assignment = await UserAssignment.create({
      userId: clientId,
      relatedUserId: therapistId,
      createdBy: therapistId,
      relationshipType: 'therapist'
    });
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/therapists/clients/:clientId/analytics?range=week|month|quarter
exports.getClientAnalytics = async (req, res) => {
  try {
    const therapistId = req.user._id;
    const { clientId } = req.params;
    const range = req.query.range || 'week';

    const assignment = await UserAssignment.findOne({
      userId: clientId,
      relatedUserId: therapistId,
      relationshipType: 'therapist',
      isActive: true
    });
    if (!assignment) {
      return res.status(403).json({ error: 'You do not have access to this client' });
    }

    const now = new Date();
    let startDate;
    let numDays;
    if (range === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      numDays = Math.ceil((now - startDate) / (24 * 60 * 60 * 1000)) + 1;
    } else if (range === 'quarter') {
      const q = Math.floor(now.getMonth() / 3) + 1;
      startDate = new Date(now.getFullYear(), (q - 1) * 3, 1);
      numDays = Math.ceil((now - startDate) / (24 * 60 * 60 * 1000)) + 1;
    } else {
      const d = new Date(now);
      d.setDate(d.getDate() - 6);
      d.setHours(0, 0, 0, 0);
      startDate = d;
      numDays = 7;
    }

    const DAY_ABBREV = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const completedActivities = await UserActivity.find({
      user: clientId,
      type: 'task_completed',
      createdAt: { $gte: startDate }
    }).populate('relatedTask', 'name routine').populate('relatedRoutine', 'title');

    const tasksInPeriod = await Task.find({ user: clientId });
    const tasksPerDayEst = Math.max(1, Math.ceil(tasksInPeriod.length / 7));

    const completedByDate = {};
    for (let i = 0; i < numDays; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      if (d > now) break;
      completedByDate[d.toISOString().slice(0, 10)] = 0;
    }

    completedActivities.forEach(a => {
      if (a.createdAt) {
        const key = new Date(a.createdAt).toISOString().slice(0, 10);
        if (completedByDate[key] !== undefined) completedByDate[key]++;
      }
    });

    let dailyCompletion = [];
    const displayDays = range === 'week' ? 7 : 7;
    const step = range === 'week' ? 1 : Math.max(1, Math.floor(numDays / displayDays));

    for (let i = 0; i < displayDays; i++) {
      const idx = range === 'week' ? i : i * step;
      const d = new Date(startDate);
      d.setDate(d.getDate() + idx);
      if (d > now) break;
      const key = d.toISOString().slice(0, 10);
      const dayName = range === 'week' ? DAY_ABBREV[(d.getDay() + 6) % 7] : `Week ${i + 1}`;
      const completed = completedByDate[key] || 0;
      const total = Math.max(completed, tasksPerDayEst);
      dailyCompletion.push({
        day: dayName,
        date: key,
        completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0
      });
    }

    if (range === 'month' || range === 'quarter') {
      const numWeeks = Math.ceil(numDays / 7);
      dailyCompletion = [];
      for (let w = 0; w < Math.min(6, numWeeks); w++) {
        let weekCompleted = 0;
        for (let d = 0; d < 7; d++) {
          const dt = new Date(startDate);
          dt.setDate(dt.getDate() + w * 7 + d);
          if (dt > now) break;
          weekCompleted += completedByDate[dt.toISOString().slice(0, 10)] || 0;
        }
        dailyCompletion.push({
          day: `W${w + 1}`,
          date: new Date(startDate.getTime() + w * 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          completed: weekCompleted,
          total: Math.max(weekCompleted, tasksPerDayEst * 7),
          percentage: tasksPerDayEst * 7 > 0 ? Math.round((weekCompleted / (tasksPerDayEst * 7)) * 100) : 0
        });
      }
    }

    const finalDaily = dailyCompletion.length > 0 ? dailyCompletion : DAY_ABBREV.map((day, i) => ({
      day, completed: 0, total: 1, percentage: 0
    }));

    const streak = await Streak.findOne({ userId: clientId });
    const weeksBack = range === 'quarter' ? 6 : range === 'month' ? 4 : 2;
    const streakData = [];
    for (let w = 0; w < weeksBack; w++) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - 7 * (weeksBack - w - 1));
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      const daysWithCompletions = new Set();
      completedActivities.forEach(a => {
        if (a.createdAt && a.createdAt >= weekStart && a.createdAt <= weekEnd) {
          daysWithCompletions.add(new Date(a.createdAt).toDateString());
        }
      });
      streakData.push({
        week: `Week ${w + 1}`,
        streak: daysWithCompletions.size,
        label: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }

    const routineCompletion = {};
    completedActivities.forEach(a => {
      const title = a.relatedRoutine?.title || a.relatedTask?.routine?.title || 'Other';
      routineCompletion[title] = (routineCompletion[title] || 0) + 1;
    });

    const totalRoutine = Object.values(routineCompletion).reduce((s, v) => s + v, 0);
    const routineBreakdown = Object.entries(routineCompletion).map(([name, count]) => ({
      name,
      value: totalRoutine > 0 ? Math.round((count / totalRoutine) * 100) : 0,
      count
    })).sort((a, b) => b.value - a.value);

    const colors = ['#4F46E5', '#7C3AED', '#10B981', '#F59E0B', '#EF4444'];
    routineBreakdown.forEach((r, i) => { r.color = colors[i % colors.length]; });

    if (routineBreakdown.length === 0) {
      routineBreakdown.push({ name: 'No routine data yet', value: 100, count: 0, color: '#94A3B8' });
    }

    const avgCompletion = finalDaily.length > 0
      ? Math.round(finalDaily.reduce((s, d) => s + d.percentage, 0) / finalDaily.length)
      : 0;

    res.json({
      dailyCompletion: finalDaily,
      streakData,
      routineBreakdown,
      summary: {
        avgCompletion,
        totalTasks: tasksInPeriod.length,
        totalCompleted: completedActivities.length,
        currentStreak: streak?.currentStreak ?? 0,
        longestStreak: streak?.longestStreak ?? 0
      },
      range
    });
  } catch (error) {
    console.error('getClientAnalytics error:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/therapists/clients/:clientId/progress?range=7d|30d|90d — same data structure as client gamification hub
exports.getClientProgress = async (req, res) => {
  try {
    const therapistId = req.user._id;
    const { clientId } = req.params;
    const range = (req.query.range || '7d');
    const validRanges = ['7d', '30d', '90d'];
    const options = { range: validRanges.includes(range) ? range : '7d' };

    const assignment = await UserAssignment.findOne({
      userId: clientId,
      relatedUserId: therapistId,
      relationshipType: 'therapist',
      isActive: true
    });
    if (!assignment) {
      return res.status(403).json({ error: 'You do not have access to this client' });
    }

    const data = await buildProgressForUser(clientId, options);
    res.json(data);
  } catch (error) {
    console.error('getClientProgress error:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/therapists/clients/:clientId/settings — therapist only views client settings
exports.getClientSettings = async (req, res) => {
  try {
    const therapistId = req.user._id;
    const { clientId } = req.params;

    const assignment = await UserAssignment.findOne({
      userId: clientId,
      relatedUserId: therapistId,
      relationshipType: 'therapist',
      isActive: true
    });
    if (!assignment) {
      return res.status(403).json({ error: 'You do not have access to this client' });
    }

    const client = await User.findById(clientId)
      .select('name email phoneNumber emergencyContact settings')
      .lean();
    if (!client) return res.status(404).json({ error: 'Client not found' });

    res.json({
      name: client.name,
      email: client.email,
      phoneNumber: client.phoneNumber,
      emergencyContact: client.emergencyContact,
      settings: client.settings || {}
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
