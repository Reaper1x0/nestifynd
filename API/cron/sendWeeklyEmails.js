const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const UserActivity = require('../models/UserActivity');
const Task = require('../models/Task');
const { sendEmail } = require('../utils/emailService');

async function sendWeeklyReports() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    for (const user of users) {
      const activities = await UserActivity.find({
        user: user._id,
        createdAt: { $gte: oneWeekAgo }
      });

      const snoozes = activities.filter(a => a.type === 'task_snoozed').length;
      const dismissals = activities.filter(a => a.type === 'task_dismissed').length;
      const reminders = activities.filter(a => a.type === 'reminder_sent').length;
      const completed = await Task.countDocuments({ user: user._id, completed: true });
      const pending = await Task.countDocuments({ user: user._id, completed: false });

      const body = `
Hello ${user.email},

Here's your weekly activity summary:

- Reminders Received: ${reminders}
- Tasks Completed: ${completed}
- Tasks Pending: ${pending}
- Snoozes: ${snoozes}
- Dismissals: ${dismissals}

Keep up the great work!

- NestifyND
      `;

      await sendEmail(user.email, 'Your Weekly Routine Summary', body);
    }

    await mongoose.disconnect();
    console.log('Weekly summary emails sent.');
  } catch (error) {
    console.error('Email sending failed:', error.message);
  }
}

sendWeeklyReports();
