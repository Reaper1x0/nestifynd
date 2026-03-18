const User = require('../models/User');
const Routine = require('../models/Routine');
const Plan = require('../models/Plan');
const Role = require('../models/Role');
const UiMode = require('../models/UiMode');
const UiModePreference = require('../models/UiModePreference');
const UserAssignment = require('../models/UserAssignment');
const Task = require('../models/Task');
const Streak = require('../models/Streak');
const Achievement = require('../models/Achievement');
const UserActivity = require('../models/UserActivity');
const AIConfig = require('../models/AIConfig');
const { buildProgressForUser } = require('./gamificationController');

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: List all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, therapist, caregiver, admin]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users
 */
/**
 * Get all users with reports/stats (Admin only) - same structure as therapist clients/reports
 */
exports.getUsersReports = async (req, res) => {
  try {
    const users = await User.find({ isActive: { $ne: false } })
      .select('name email lastLogin')
      .populate('role', 'name displayName')
      .populate('plan', 'name price')
      .populate('uiMode', 'name category')
      .lean();
    const reports = [];
    for (const u of users) {
      const streak = await Streak.findOne({ userId: u._id });
      const achievements = await Achievement.find({ userId: u._id }).populate('badgeId');
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const activities = await UserActivity.find({
        user: u._id,
        createdAt: { $gte: oneWeekAgo }
      });
      const completedCount = activities.filter(a => a.type === 'task_completed').length;
      const tasksInPeriod = await Task.find({
        user: u._id,
        updatedAt: { $gte: oneWeekAgo }
      });
      const totalTasks = tasksInPeriod.length;
      const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
      const latestActivity = await UserActivity.findOne({ user: u._id }).sort({ createdAt: -1 }).select('createdAt').lean();
      const lastActivityDate = latestActivity?.createdAt || u.lastLogin;
      reports.push({
        clientId: u._id,
        id: u._id.toString(),
        name: u.name || u.email,
        email: u.email,
        lastLogin: u.lastLogin,
        lastActivity: lastActivityDate,
        streak: streak ? streak.currentStreak : 0,
        longestStreak: streak ? streak.longestStreak : 0,
        badgesEarned: achievements.length,
        completionRate,
        missedRoutines: activities.filter(a => a.type === 'reminder_sent').length,
        unreadMessages: 0,
        status: completionRate >= 80 ? 'excellent' : completionRate >= 50 ? 'active' : 'needs-attention',
        role: u.role?.name,
        plan: u.plan,
        uiMode: u.uiMode
      });
    }
    res.json({ reports });
  } catch (err) {
    console.error('Admin getUsersReports error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get progress data for any user (Admin only)
 */
exports.getUserProgress = async (req, res) => {
  try {
    const { userId } = req.params;
    const range = (req.query.range || '7d');
    const validRanges = ['7d', '30d', '90d'];
    const options = { range: validRanges.includes(range) ? range : '7d' };
    const data = await buildProgressForUser(userId, options);
    res.json(data);
  } catch (err) {
    console.error('Admin getUserProgress error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get routines with tasks for any user (Admin only)
 */
exports.getUserRoutinesWithTasks = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const routines = await Routine.find({ user: userId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    for (const r of routines) {
      r.tasks = await Task.find({ routine: r._id }).sort({ order: 1, scheduledTime: 1 }).lean();
    }
    res.json(routines);
  } catch (err) {
    console.error('Admin getUserRoutinesWithTasks error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get single user by ID (Admin only) - for Edit modal
 */
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)
      .select('-password')
      .populate('role', 'name displayName')
      .populate('plan', 'name price')
      .populate('uiMode', 'name category')
      .lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Admin getUserById error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const query = { isActive: { $ne: false } };
    if (role) {
      const roleDoc = await Role.findOne({ name: role });
      if (roleDoc) query.role = roleDoc._id;
    }
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: regex },
        { email: regex }
      ];
    }
    const users = await User.find(query)
      .select('-password')
      .populate('role', 'name displayName')
      .populate('plan', 'name price')
      .populate('uiMode', 'name category')
      .sort({ createdAt: -1 })
      .lean();
    res.json(users);
  } catch (err) {
    console.error('Admin listUsers error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * @swagger
 * /api/admin/assign-role:
 *   put:
 *     summary: Assign role to user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - roleId
 *             properties:
 *               userId:
 *                 type: string
 *               roleId:
 *                 type: string
 *     responses:
 *       200:
 *         description: User role updated
 */
exports.assignRole = async (req, res) => {
  try {
    const { userId, roleId } = req.body;
    if (!userId || !roleId) {
      return res.status(400).json({ error: 'userId and roleId are required' });
    }
    const user = await User.findByIdAndUpdate(userId, { role: roleId }, { new: true })
      .select('-password')
      .populate('role', 'name displayName')
      .populate('plan', 'name');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Admin assignRole error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * @swagger
 * /api/admin/assign-ui-mode:
 *   put:
 *     summary: Assign UI mode to user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - uiModeId
 *             properties:
 *               userId:
 *                 type: string
 *               uiModeId:
 *                 type: string
 *     responses:
 *       200:
 *         description: User UI mode updated
 */
exports.assignUiMode = async (req, res) => {
  try {
    const { userId, uiModeId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    let themeFromUiMode = 'light';
    if (uiModeId) {
      const uiMode = await UiMode.findById(uiModeId).select('category');
      if (uiMode?.category) {
        const categoryToTheme = {
          light: 'light',
          dark: 'dark',
          'high-contrast': 'high-contrast',
          'low-distraction': 'light'
        };
        themeFromUiMode = categoryToTheme[uiMode.category] || 'light';
      }
    }

    const userDoc = await User.findById(userId);
    if (!userDoc) return res.status(404).json({ error: 'User not found' });

    userDoc.uiMode = uiModeId || undefined;
    userDoc.settings = userDoc.settings || {};
    userDoc.settings.theme = themeFromUiMode;
    userDoc.markModified('settings');
    await userDoc.save();

    // Sync UiModePreference so Settings/ThemeContext reads correctly
    if (uiModeId) {
      let pref = await UiModePreference.findOne({ userId });
      if (!pref) pref = new UiModePreference({ userId });
      pref.uiMode = uiModeId;
      pref.lastUpdated = Date.now();
      await pref.save();
    } else {
      await UiModePreference.findOneAndDelete({ userId });
    }

    const user = await User.findById(userId)
      .select('-password')
      .populate('role', 'name')
      .populate('plan', 'name')
      .populate('uiMode', 'name category');
    res.json(user);
  } catch (err) {
    console.error('Admin assignUiMode error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * @swagger
 * /api/admin/assignments:
 *   get:
 *     summary: List all user assignments (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of assignments
 */
exports.listAssignments = async (req, res) => {
  try {
    const assignments = await UserAssignment.find({ isActive: true })
      .populate('userId', 'name email')
      .populate('relatedUserId', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    res.json(assignments);
  } catch (err) {
    console.error('Admin listAssignments error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Set active routine for a user (Admin only)
 * Requirement: Admins can set active routines
 */
exports.setActiveRoutine = async (req, res) => {
  try {
    const { userId, routineId } = req.body;
    if (!userId || !routineId) return res.status(400).json({ error: 'userId and routineId are required' });
    const routine = await Routine.findById(routineId);
    if (!routine) return res.status(404).json({ error: 'Routine not found' });
    if (!routine.user.equals(userId)) return res.status(400).json({ error: 'Routine does not belong to this user' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await routine.activate();
    await user.setActiveRoutine(routine._id);
    const Activity = require('../models/UserActivity');
    await Activity.logActivity(
      userId,
      `Routine activated by admin: ${routine.title}`,
      `Routine "${routine.title}" was set as active by administrator`,
      'routine_activated',
      { routineId: routine._id }
    );
    const updated = await Routine.findById(routineId).populate('user', 'name email');
    res.json({ message: 'Routine set as active', routine: updated });
  } catch (err) {
    console.error('Admin setActiveRoutine error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * List routines for admin (all or filtered by userId)
 */
exports.listRoutines = async (req, res) => {
  try {
    const { userId } = req.query;
    const query = userId ? { user: userId } : {};
    const routines = await Routine.find(query)
      .populate('user', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    res.json(routines);
  } catch (err) {
    console.error('Admin listRoutines error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * @swagger
 * /api/admin/update-user-plan:
 *   put:
 *     summary: Update user's plan (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - planId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user to update
 *                 example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *               planId:
 *                 type: string
 *                 description: ID of the new plan
 *                 example: "60f7b3b3b3b3b3b3b3b3b3b4"
 *     responses:
 *       200:
 *         description: User plan updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * When plan does not allow therapist/caregiver, remove those assignments entirely
 * so the user can add them again after upgrading (avoids duplicate key on re-add).
 */
async function revokeAssignmentsNotAllowedByPlan(userId, plan) {
  const limits = plan?.limits || {};
  const therapistAllowed = limits.therapist?.allowed && (limits.therapist?.maxAllowed ?? 0) > 0;
  const caregiverAllowed = limits.caregiver?.allowed && (limits.caregiver?.maxAllowed ?? 0) > 0;
  if (!therapistAllowed) {
    await UserAssignment.deleteMany({ userId, relationshipType: 'therapist' });
  }
  if (!caregiverAllowed) {
    await UserAssignment.deleteMany({ userId, relationshipType: 'caregiver' });
  }
}

exports.updateUserPlan = async (req, res) => {
  try {
    const { userId, planId } = req.body;
    if (!userId || !planId) return res.status(400).json({ error: 'userId and planId are required' });
    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    const updated = await User.findByIdAndUpdate(userId, { plan: planId }, { new: true })
      .select('-password')
      .populate('role', 'name')
      .populate('plan', 'name price');
    if (!updated) return res.status(404).json({ error: 'User not found' });
    await revokeAssignmentsNotAllowedByPlan(userId, plan);
    res.json(updated);
  } catch (err) {
    console.error('Admin updateUserPlan error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * @swagger
 * /api/admin/force-complete-routine:
 *   put:
 *     summary: Force complete a routine (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - routineId
 *             properties:
 *               routineId:
 *                 type: string
 *                 description: ID of the routine to force complete
 *                 example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *     responses:
 *       200:
 *         description: Routine completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Routine'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
exports.forceRoutineComplete = async (req, res) => {
  try {
    const { routineId } = req.body;
    if (!routineId) return res.status(400).json({ error: 'routineId is required' });
    const routine = await Routine.findById(routineId).populate('user', 'name email');
    if (!routine) return res.status(404).json({ error: 'Routine not found' });
    const now = new Date();
    await Task.updateMany(
      { routine: routineId },
      { $set: { completed: true, completedAt: now } }
    );
    routine.isActive = false;
    await routine.save();
    res.json(routine);
  } catch (err) {
    console.error('Admin forceRoutineComplete error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * @swagger
 * /api/admin/downgrade:
 *   put:
 *     summary: Downgrade user to Free plan (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user to downgrade
 *                 example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *     responses:
 *       200:
 *         description: User downgraded to Free plan successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
exports.downgradePlan = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const freePlan = await Plan.findOne({ name: 'Free' });
    if (!freePlan) return res.status(500).json({ error: 'Free plan not found in database' });
    const user = await User.findByIdAndUpdate(userId, { plan: freePlan._id }, { new: true })
      .select('-password')
      .populate('role', 'name')
      .populate('plan', 'name price');
    if (!user) return res.status(404).json({ error: 'User not found' });
    await revokeAssignmentsNotAllowedByPlan(userId, freePlan);
    res.json(user);
  } catch (err) {
    console.error('Admin downgradePlan error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get statistics - Admin only
 * Query: period = 'week' | 'month' | 'year'
 */
exports.getStatistics = async (req, res) => {
  try {
    const period = (req.query.period || 'month').toLowerCase();
    const validPeriods = ['week', 'month', 'year'];
    const p = validPeriods.includes(period) ? period : 'month';

    const now = new Date();
    let startDate = new Date(now);
    if (p === 'week') startDate.setDate(now.getDate() - 7);
    else if (p === 'month') startDate.setMonth(now.getMonth() - 1);
    else startDate.setFullYear(now.getFullYear() - 1);

    const [totalUsers, newUsers, paidPlans, usersRaw] = await Promise.all([
      User.countDocuments({ isActive: { $ne: false } }),
      User.countDocuments({ createdAt: { $gte: startDate }, isActive: { $ne: false } }),
      Plan.find({ name: { $in: ['Basic', 'Premium'] } }).select('_id'),
      User.find({ isActive: { $ne: false } })
        .select('name email createdAt plan')
        .populate('role', 'name displayName')
        .populate('plan', 'name price')
        .sort({ createdAt: -1 })
        .lean()
    ]);

    const paidPlanIds = paidPlans.map((p) => p._id);
    const subscribedCount = paidPlanIds.length
      ? await User.countDocuments({ plan: { $in: paidPlanIds }, isActive: { $ne: false } })
      : 0;

    const usersWithPlans = usersRaw.map((u) => {
      const planName = (u.plan && (u.plan.name === 'Free' || u.plan.name === 'Basic' || u.plan.name === 'Premium'))
        ? u.plan.name
        : 'Free';
      const planPrice = u.plan?.price ?? (planName === 'Free' ? 0 : 0);
      return {
        id: u._id,
        name: u.name || '-',
        email: u.email || '-',
        planName,
        planPrice,
        roleName: u.role?.displayName || u.role?.name || 'User',
        createdAt: u.createdAt
      };
    });

    const planCounts = {};
    usersWithPlans.forEach((u) => {
      const name = ['Free', 'Basic', 'Premium'].includes(u.planName) ? u.planName : 'Free';
      planCounts[name] = (planCounts[name] || 0) + 1;
    });
    const planColors = { Free: '#94A3B8', Basic: '#4F46E5', Premium: '#10B981' };
    const planDistribution = Object.entries(planCounts).map(([name, count]) => ({
      name,
      count,
      fill: planColors[name] || '#6B7280'
    }));

    let newUsersTrend = [];
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);
    if (p === 'week') {
      const weekStartUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 6, 0, 0, 0, 0));
      const agg = await User.aggregate([
        { $match: { createdAt: { $gte: weekStartUTC }, isActive: { $ne: false } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);
      const byDate = {};
      agg.forEach((r) => { byDate[r._id] = r.count; });
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i, 0, 0, 0, 0));
        const key = d.toISOString().slice(0, 10);
        newUsersTrend.push({ label: d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }), count: byDate[key] || 0 });
      }
    } else if (p === 'month' || p === 'year') {
      const months = p === 'month' ? 4 : 12;
      const agg = await User.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(now.getFullYear(), now.getMonth() - months, 1),
              $lte: now
            },
            isActive: { $ne: false }
          }
        },
        { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);
      const byMonth = {};
      agg.forEach((r) => { byMonth[`${r._id.year}-${r._id.month}`] = r.count; });
      for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
        newUsersTrend.push({ label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }), count: byMonth[key] || 0 });
      }
    }

    res.json({
      totalUsers,
      newUsers,
      subscribedUsers: subscribedCount,
      period: p,
      startDate: startDate.toISOString(),
      usersWithPlans,
      planDistribution,
      newUsersTrend
    });
  } catch (err) {
    console.error('Admin getStatistics error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get AI config (quote system etc.) - Admin only
 */
exports.getAIConfig = async (req, res) => {
  try {
    let config = await AIConfig.findOne({ key: 'default' });
    if (!config) {
      config = await AIConfig.create({
        key: 'default',
        quotesInRemindersEnabled: false,
        useAIForQuotes: false
      });
    }
    const maskedKey = config.getMaskedApiKey();
    const hasEnvKey = !!process.env.OPENAI_API_KEY;
    res.json({
      _id: config._id,
      key: config.key,
      quotesInRemindersEnabled: config.quotesInRemindersEnabled,
      useAIForQuotes: config.useAIForQuotes,
      openaiApiKeyMasked: maskedKey,
      hasApiKey: !!maskedKey || hasEnvKey,
      apiKeySource: maskedKey ? 'database' : (hasEnvKey ? 'environment' : 'none'),
      updatedAt: config.updatedAt
    });
  } catch (err) {
    console.error('Admin getAIConfig error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Update AI config (admin-configured quote system) - Admin only
 */
exports.updateAIConfig = async (req, res) => {
  try {
    const { quotesInRemindersEnabled, useAIForQuotes, openaiApiKey } = req.body;
    
    let config = await AIConfig.findOne({ key: 'default' });
    if (!config) {
      config = new AIConfig({ key: 'default' });
    }
    
    if (typeof quotesInRemindersEnabled === 'boolean') {
      config.quotesInRemindersEnabled = quotesInRemindersEnabled;
    }
    if (typeof useAIForQuotes === 'boolean') {
      config.useAIForQuotes = useAIForQuotes;
    }
    if (typeof openaiApiKey === 'string') {
      if (openaiApiKey.trim() === '') {
        config.openaiApiKeyEncrypted = null;
      } else {
        config.setApiKey(openaiApiKey.trim());
      }
    }
    
    config.updatedAt = new Date();
    config.updatedBy = req.user._id;
    await config.save();
    
    const maskedKey = config.getMaskedApiKey();
    const hasEnvKey = !!process.env.OPENAI_API_KEY;
    res.json({
      _id: config._id,
      key: config.key,
      quotesInRemindersEnabled: config.quotesInRemindersEnabled,
      useAIForQuotes: config.useAIForQuotes,
      openaiApiKeyMasked: maskedKey,
      hasApiKey: !!maskedKey || hasEnvKey,
      apiKeySource: maskedKey ? 'database' : (hasEnvKey ? 'environment' : 'none'),
      updatedAt: config.updatedAt
    });
  } catch (err) {
    console.error('Admin updateAIConfig error:', err);
    res.status(500).json({ error: err.message });
  }
};
