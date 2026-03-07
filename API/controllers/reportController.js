
const Activity = require('../models/UserActivity');
const Task = require('../models/Task');
const Routine = require('../models/Routine');
const User = require('../models/User');
const { Parser } = require('json2csv');

exports.getWeeklyReport = async (req, res) => {
  try {
    const userId = req.params.userId;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Get activities for the user
    const activities = await Activity.find({
      user: userId,
      createdAt: { $gte: oneWeekAgo }
    });

    // Count different types of activities
    const snoozes = activities.filter(a => a.type === 'task_snoozed').length;
    const dismissals = activities.filter(a => a.type === 'task_dismissed').length;
    const reminders = activities.filter(a => a.type === 'reminder_sent').length;
    const completed = activities.filter(a => a.type === 'task_completed').length;
    
    // Get task counts for the period
    const tasksInPeriod = await Task.find({
      user: userId,
      createdAt: { $gte: oneWeekAgo }
    });
    
    const pendingTasks = tasksInPeriod.filter(t => !t.completed && !t.isDismissed).length;
    const completedTasks = tasksInPeriod.filter(t => t.completed).length;

    const report = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      period: {
        start: oneWeekAgo,
        end: new Date()
      },
      activities: {
        snoozes,
        dismissals,
        reminders,
        completed
      },
      tasks: {
        completed: completedTasks,
        pending: pendingTasks,
        total: tasksInPeriod.length
      },
      generatedAt: new Date()
    };

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.downloadWeeklyReport = async (req, res) => {
  try {
    const userId = req.params.userId;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Get activities for the user
    const activities = await Activity.find({
      user: userId,
      createdAt: { $gte: oneWeekAgo }
    });

    // Count different types of activities
    const snoozes = activities.filter(a => a.type === 'task_snoozed').length;
    const dismissals = activities.filter(a => a.type === 'task_dismissed').length;
    const reminders = activities.filter(a => a.type === 'reminder_sent').length;
    const completed = activities.filter(a => a.type === 'task_completed').length;
    
    // Get task counts for the period
    const tasksInPeriod = await Task.find({
      user: userId,
      createdAt: { $gte: oneWeekAgo }
    });
    
    const pendingTasks = tasksInPeriod.filter(t => !t.completed && !t.isDismissed).length;
    const completedTasks = tasksInPeriod.filter(t => t.completed).length;

    const report = [{
      user: user.email,
      userName: user.name,
      periodStart: oneWeekAgo.toISOString(),
      periodEnd: new Date().toISOString(),
      snoozes,
      dismissals,
      reminders,
      completedTasks,
      pendingTasks,
      totalTasks: tasksInPeriod.length,
      generatedAt: new Date().toISOString()
    }];

    const parser = new Parser();
    const csv = parser.parse(report);

    res.header('Content-Type', 'text/csv');
    res.attachment(`weekly_report_${user.email}_${new Date().toISOString().split('T')[0]}.csv`);
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllWeeklyReports = async (req, res) => {
  try {
    const userRoleName = req.user?.role?.name || req.userRole;
    if (userRoleName !== 'admin') {
      return res.status(403).json({ error: 'Only admins can view all reports' });
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const users = await User.find();

    const data = [];

    for (const user of users) {
      const activities = await Activity.find({
        user: user._id,
        createdAt: { $gte: oneWeekAgo }
      });

      const snoozes = activities.filter(a => a.type === 'task_snoozed').length;
      const dismissals = activities.filter(a => a.type === 'task_dismissed').length;
      const reminders = activities.filter(a => a.type === 'reminder_sent').length;
      const completed = activities.filter(a => a.type === 'task_completed').length;
      
      // Get task counts for the period
      const tasksInPeriod = await Task.find({
        user: user._id,
        createdAt: { $gte: oneWeekAgo }
      });
      
      const pendingTasks = tasksInPeriod.filter(t => !t.completed && !t.isDismissed).length;
      const completedTasks = tasksInPeriod.filter(t => t.completed).length;

      data.push({
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        period: {
          start: oneWeekAgo,
          end: new Date()
        },
        activities: {
          snoozes,
          dismissals,
          reminders,
          completed
        },
        tasks: {
          completed: completedTasks,
          pending: pendingTasks,
          total: tasksInPeriod.length
        },
        generatedAt: new Date()
      });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.downloadAllWeeklyReports = async (req, res) => {
  try {
    const userRoleName = req.user?.role?.name || req.userRole;
    if (userRoleName !== 'admin') {
      return res.status(403).json({ error: 'Only admins can download reports' });
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const users = await User.find();

    const data = [];

    for (const user of users) {
      const activities = await Activity.find({
        user: user._id,
        createdAt: { $gte: oneWeekAgo }
      });

      const snoozes = activities.filter(a => a.type === 'task_snoozed').length;
      const dismissals = activities.filter(a => a.type === 'task_dismissed').length;
      const reminders = activities.filter(a => a.type === 'reminder_sent').length;
      const completed = activities.filter(a => a.type === 'task_completed').length;
      
      // Get task counts for the period
      const tasksInPeriod = await Task.find({
        user: user._id,
        createdAt: { $gte: oneWeekAgo }
      });
      
      const pendingTasks = tasksInPeriod.filter(t => !t.completed && !t.isDismissed).length;
      const completedTasks = tasksInPeriod.filter(t => t.completed).length;

      data.push({
        user: user.email,
        userName: user.name,
        periodStart: oneWeekAgo.toISOString(),
        periodEnd: new Date().toISOString(),
        snoozes,
        dismissals,
        reminders,
        completedTasks,
        pendingTasks,
        totalTasks: tasksInPeriod.length,
        generatedAt: new Date().toISOString()
      });
    }

    const parser = new Parser();
    const csv = parser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment(`all_weekly_reports_${new Date().toISOString().split('T')[0]}.csv`);
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
