// controllers/notificationController.js
const User = require('../models/User');
const Achievement = require('../models/Achievement');
const Message = require('../models/Message');
const moment = require('moment');
const Routine = require('../models/Routine');
const Task = require('../models/Task');
const { sendEmailReminder } = require('../utils/emailService');
const { sendSmsReminder } = require('../utils/smsService');

exports.sendScheduledReminders = async (req, res) => {
  const now = new Date();
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000);

  try {
    const users = await User.find({});

    for (const user of users) {
      const routines = await Routine.find({
        userId: user._id,
        active: true,
        'reminders.time': {
          $gte: now,
          $lte: fiveMinutesFromNow
        }
      });

      const tasks = await Task.find({
        userId: user._id,
        dueDate: {
          $gte: now,
          $lte: fiveMinutesFromNow
        }
      });

      routines.forEach(routine => {
        routine.reminders.forEach(async reminder => {
          if (reminder.time >= now && reminder.time <= fiveMinutesFromNow) {
            if (user.email) await sendEmailReminder(user, routine.name, 'routine');
            if (user.phoneNumber) await sendSmsReminder(user, routine.name, 'routine');
          }
        });
      });

      tasks.forEach(async task => {
        if (user.email) await sendEmailReminder(user, task.name, 'task');
        if (user.phoneNumber) await sendSmsReminder(user, task.name, 'task');
      });
    }

    res.json({ message: 'Reminders sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send reminders' });
  }
};

exports.getCounts = async (req, res) => {
  try {
    const userId = req.user._id;
    const sevenDaysAgo = moment().subtract(7, 'days').toDate();
    
    // Count unread messages where current user is the receiver
    const unreadMessages = await Message.countDocuments({
      receiverId: userId,
      read: false
    });
    
    // Count new achievements from last 7 days
    const newAchievements = await Achievement.countDocuments({
      userId,
      earnedAt: { $gte: sevenDaysAgo }
    });
    
    // Count pending routines for today
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const pendingRoutines = await Routine.countDocuments({
      user: userId,
      isActive: true,
      'schedule.daysOfWeek': dayOfWeek
    });
    
    res.json({
      messages: unreadMessages,
      achievements: newAchievements,
      routines: pendingRoutines,
      reminders: 0,
      system: 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ messages: 0, achievements: 0, routines: 0, reminders: 0, system: 0 });
  }
};