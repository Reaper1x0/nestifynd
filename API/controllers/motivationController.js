// controllers/motivationController.js
const MotivationQuote = require('../models/MotivationQuote');
const User = require('../models/User');
const Task = require('../models/Task');
const generateQuote = require('../utils/openaiHelper');

exports.getMotivationalQuote = async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user.id;

  try {
    const task = await Task.findById(taskId);
    if (!task || task.userId.toString() !== userId) {
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }

    // Simulate behavior from task data
    const userBehavior = `
      Task: ${task.name}
      Completed: ${task.completedCount} times
      Snoozed: ${task.snoozedCount} times
      Last completed: ${task.lastCompleted ? task.lastCompleted : 'Never'}
    `;

    const quote = await generateQuote(userBehavior);

    const newQuote = new MotivationQuote({
      userId,
      taskId,
      quote
    });

    await newQuote.save();

    res.json({ quote });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating quote' });
  }
};