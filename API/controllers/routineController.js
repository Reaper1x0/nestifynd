
const Routine = require('../models/Routine');
const Activity = require('../models/UserActivity');

exports.getAll = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get routines for the current user only
    const routines = await Routine.find({ user: userId })
      .populate('user', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(routines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const routine = await Routine.findById(id)
      .populate('user', 'name email')
      .populate('createdBy', 'name email');
    
    if (!routine) return res.status(404).json({ error: 'Routine not found' });
    
    // Check if routine belongs to user
    if (!routine.user._id.equals(userId)) {
      return res.status(403).json({ error: 'Unauthorized to view this routine' });
    }
    
    res.json(routine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const userId = req.user._id;
    const { user, ...routineData } = req.body;
    
    // Create routine with user and creator
    const routine = new Routine({
      ...routineData,
      user: userId,
      createdBy: userId
    });
    
    await routine.save();
    
    // Log activity
    await Activity.logActivity(
      userId,
      `Routine created: ${routine.title}`,
      `Routine "${routine.title}" was created`,
      'other',
      { routineId: routine._id }
    );
    
    res.status(201).json(routine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const routine = await Routine.findById(id);
    if (!routine) return res.status(404).json({ error: 'Routine not found' });
    
    // Check if routine belongs to user
    if (!routine.user.equals(userId)) {
      return res.status(403).json({ error: 'Unauthorized to update this routine' });
    }
    
    const updatedRoutine = await Routine.findByIdAndUpdate(id, req.body, { new: true });
    
    // Log activity
    await Activity.logActivity(
      userId,
      `Routine updated: ${updatedRoutine.title}`,
      `Routine "${updatedRoutine.title}" was updated`,
      'other',
      { routineId: updatedRoutine._id }
    );
    
    res.json(updatedRoutine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const routine = await Routine.findById(id);
    if (!routine) return res.status(404).json({ error: 'Routine not found' });
    
    // Check if routine belongs to user
    if (!routine.user.equals(userId)) {
      return res.status(403).json({ error: 'Unauthorized to delete this routine' });
    }
    
    await Routine.findByIdAndDelete(id);
    
    // Log activity
    await Activity.logActivity(
      userId,
      `Routine deleted: ${routine.title}`,
      `Routine "${routine.title}" was deleted`,
      'other',
      { routineId: routine._id }
    );
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.setActiveRoutine = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const routine = await Routine.findById(id);
    if (!routine) return res.status(404).json({ error: 'Routine not found' });

    // Check if routine belongs to user
    if (!routine.user.equals(userId)) {
      return res.status(403).json({ error: 'Unauthorized to change active routine' });
    }

    // Use the new model method
    await routine.activate();

    // Log activity
    await Activity.logActivity(
      userId,
      `Routine activated: ${routine.title}`,
      `Routine "${routine.title}" was set as active`,
      'routine_activated',
      { routineId: routine._id }
    );

    res.json({ message: 'Routine set as active', routine });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getActiveRoutine = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const activeRoutine = await Routine.getActiveForUser(userId);
    
    if (!activeRoutine) {
      return res.status(404).json({ error: 'No active routine found' });
    }
    
    res.json(activeRoutine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
