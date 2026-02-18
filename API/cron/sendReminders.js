
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Task = require('../models/Task');
const Routine = require('../models/Routine');
const UserAssignment = require('../models/UserAssignment');
const Activity = require('../models/Activity');

async function sendReminders() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const activeRoutines = await Routine.find({ active: true });

    for (const routine of activeRoutines) {
      const tasks = await Task.find({ routineId: routine._id, completed: false });
      const user = await User.findById(routine.userId);

      // Find caretakers assigned to this user
      const caregivers = await UserAssignment.find({
        userId: user._id
      }).populate({
        path: 'relatedUserId',
        match: { role: 'caretaker' }
      });

      for (const task of tasks) {
        const message = `Reminder sent to ${user.email} for task: ${task.name}`;
        console.log(message);

        await Activity.create({
          userId: user._id,
          action: `Reminder sent for task: ${task.name}`,
          meta: {
            taskId: task._id,
            routineId: routine._id
          }
        });

        for (const cg of caregivers) {
          if (cg.relatedUserId) {
            await Activity.create({
              userId: cg.relatedUserId._id,
              action: `User ${user.email} received reminder for task: ${task.name}`,
              meta: {
                taskId: task._id,
                userId: user._id
              }
            });
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
