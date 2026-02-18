// controllers/notificationController.js
const User = require('../models/User');
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