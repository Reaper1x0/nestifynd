const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Task = require('../models/Task');
const Routine = require('../models/Routine');
const UserAssignment = require('../models/UserAssignment');
const UserActivity = require('../models/UserActivity');
const AIConfig = require('../models/AIConfig');
const { sendEmail } = require('../utils/emailService');
const { getRandomQuoteText } = require('../controllers/quoteController');
const { generateQuote } = require('../utils/openaiHelper');

async function getQuoteForReminder(aiConfig, user, task) {
  const quotesEnabled = aiConfig?.quotesInRemindersEnabled !== false;
  const userOptIn = user.motivationalOptIn !== false;
  if (!quotesEnabled || !userOptIn) return null;
  try {
    if (aiConfig?.useAIForQuotes) {
      return await generateQuote(`Task: ${task.name}. Reminder time.`);
    }
    return getRandomQuoteText();
  } catch (e) {
    return getRandomQuoteText();
  }
}

async function sendReminders() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const aiConfig = await AIConfig.findOne({ key: 'default' }).lean();
    const activeRoutines = await Routine.find({ isActive: true });

    for (const routine of activeRoutines) {
      const tasks = await Task.find({
        routine: routine._id,
        completed: false,
        isDismissed: false,
        isSnoozed: false
      });
      const user = await User.findById(routine.user).select('email name motivationalOptIn');
      if (!user) continue;

      const assignments = await UserAssignment.find({
        userId: user._id,
        relationshipType: 'caregiver',
        isActive: true
      }).populate('relatedUserId', 'name email');

      for (const task of tasks) {
        const now = new Date();
        const [h, m] = (task.scheduledTime || '09:00').split(':').map(Number);
        const taskTime = new Date(now);
        taskTime.setHours(h, m, 0, 0);
        const diffMins = (taskTime - now) / 60000;
        if (diffMins < 0 || diffMins > 15) continue;

        const quoteText = await getQuoteForReminder(aiConfig, user, task);
        const reminderBody = quoteText
          ? `Reminder sent for task: ${task.name}\n\n“${quoteText}”`
          : `Reminder sent for task: ${task.name}`;
        const message = `Reminder sent to ${user.email} for task: ${task.name}`;
        console.log(message);

        await UserActivity.logActivity(
          user._id,
          `Reminder sent for task: ${task.name}`,
          reminderBody,
          'reminder_sent',
          { taskId: task._id, routineId: routine._id, quote: quoteText || undefined }
        );

        for (const a of assignments) {
          if (a.relatedUserId && a.permissions && a.permissions.canReceiveNotifications) {
            // Log activity for caregiver
            await UserActivity.logActivity(
              a.relatedUserId._id,
              `User ${user.email} received reminder for task: ${task.name}`,
              `User ${user.email} received reminder for task: ${task.name}`,
              'reminder_sent',
              { taskId: task._id, userId: user._id }
            );
            
            // Send email notification to caregiver (mock service - console output)
            const caregiverEmail = a.relatedUserId.email;
            const caregiverName = a.relatedUserId.name || 'Caregiver';
            const userName = user.name || user.email;
            if (caregiverEmail) {
              await sendEmail(
                caregiverEmail,
                `Reminder Sent - ${userName}`,
                `Hi ${caregiverName},\n\nThis is to notify you that a reminder was sent to ${userName} for the following task:\n\nTask: "${task.name}"\nScheduled Time: ${task.scheduledTime}\n\nBest regards,\nNestifyND Team`
              );
            }
          }
        }
      }
    }

    await mongoose.disconnect();
    console.log('Reminder run completed');
  } catch (error) {
    console.error('Reminder error:', error.message);
  }
}

sendReminders();
