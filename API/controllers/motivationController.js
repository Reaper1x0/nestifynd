// controllers/motivationController.js
const MotivationQuote = require('../models/MotivationQuote');
const User = require('../models/User');
const Task = require('../models/Task');
const AIConfig = require('../models/AIConfig');
const { generateQuote, isConfigured } = require('../utils/openaiHelper');
const { getRandomQuoteText } = require('./quoteController');

// Test endpoint to generate a quote without needing a task
exports.testQuoteGeneration = async (req, res) => {
  try {
    const aiConfig = await AIConfig.findOne({ key: 'default' }).lean();
    
    if (!aiConfig?.quotesInRemindersEnabled) {
      return res.json({ 
        success: false, 
        message: 'Quotes in reminders is disabled in Admin settings',
        quote: null 
      });
    }
    
    let quote;
    let source;
    
    if (aiConfig?.useAIForQuotes) {
      const configured = await isConfigured();
      if (!configured) {
        return res.json({ 
          success: false, 
          message: 'AI quotes enabled but no API key configured',
          quote: null 
        });
      }
      quote = await generateQuote('Morning routine task. User is about to start their day.');
      source = 'AI-generated';
    } else {
      quote = getRandomQuoteText();
      source = 'Static quote';
    }
    
    res.json({ 
      success: true, 
      source,
      quote,
      settings: {
        quotesInRemindersEnabled: aiConfig?.quotesInRemindersEnabled,
        useAIForQuotes: aiConfig?.useAIForQuotes
      }
    });
  } catch (error) {
    console.error('Quote test error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMotivationalQuote = async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user._id.toString();

  try {
    const task = await Task.findById(taskId).lean();
    if (!task || task.user.toString() !== userId) {
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }

    const userBehavior = [
      `Task: ${task.name}`,
      `Completed: ${task.completed ? 'Yes' : 'No'}`,
      task.completedAt ? `Last completed: ${task.completedAt}` : 'Not yet completed'
    ].join('\n');

    const quote = await generateQuote(userBehavior);

    await MotivationQuote.create({
      userId: req.user._id,
      taskId,
      quote
    });

    res.json({ quote });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating quote' });
  }
};