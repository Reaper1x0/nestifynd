// controllers/templateController.js
const RoutineTemplate = require('../models/RoutineTemplate');

exports.getAllTemplates = async (req, res) => {
  try {
    const templates = await RoutineTemplate.find({});
    res.json(templates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching templates' });
  }
};

exports.getTemplateById = async (req, res) => {
  const { id } = req.params;

  try {
    const template = await RoutineTemplate.findById(id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching template' });
  }
};

exports.applyTemplateToUser = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const template = await RoutineTemplate.findById(id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Clone template into user's routine
    const newRoutine = {
      userId,
      name: template.name,
      description: template.description,
      active: true,
      reminders: [], // To be set by user
      tasks: template.tasks.map(task => ({
        ...task.toObject(),
        completed: false,
        snoozedCount: 0
      }))
    };

    // Save to user's routines (assuming you have a Routine model)
    // Replace this with actual logic based on your existing system
    res.json(newRoutine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error applying template' });
  }
};