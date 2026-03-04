const Routine = require('../models/Routine');
const User = require('../models/User');
const Activity = require('../models/UserActivity');
const UserAssignment = require('../models/UserAssignment');
const Task = require('../models/Task');

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

    // Mark routine as active (and deactivate others)
    await routine.activate();

    // Set user's activeRoutine so it's stored on the user document
    const user = await User.findById(userId);
    if (user) {
      await user.setActiveRoutine(routine._id);
    }

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

// Create a routine for a user (for therapists/caregivers or admin)
exports.createUserRoutine = async (req, res) => {
  try {
    const { userId } = req.params;
    const therapistId = req.user._id;
    const { tasks: tasksData, ...routineData } = req.body;
    const isAdmin = req.user.role?.name === 'admin';

    if (!isAdmin) {
      const assignment = await UserAssignment.findOne({
        userId,
        relatedUserId: therapistId,
        isActive: true
      });
      if (!assignment) {
        return res.status(403).json({ error: 'Not authorized to create routines for this user' });
      }
      const isTherapist = req.user.role?.name === 'therapist';
      const canModify = isTherapist || assignment.permissions?.canOverrideSettings;
      if (!canModify) {
        return res.status(403).json({ error: 'You do not have permission to create routines' });
      }
    }

    const routine = new Routine({
      ...routineData,
      user: userId,
      createdBy: therapistId
    });
    await routine.save();

    const tasks = Array.isArray(tasksData) ? tasksData : [];
    for (let i = 0; i < tasks.length; i++) {
      const t = tasks[i];
      const task = new Task({
        name: t.name || t.title || 'Task',
        description: t.description || '',
        routine: routine._id,
        user: userId,
        scheduledTime: routineData.schedule?.startTime || '09:00',
        type: 'daily',
        estimatedDuration: t.estimatedDuration || t.estimatedTime || 15,
        completionCriteria: t.completionCriteria || 'manual',
        order: i
      });
      await task.save();
    }

    const roleLabel = isAdmin ? 'admin' : (req.user.role?.name === 'therapist' ? 'therapist' : 'caregiver');
    await Activity.logActivity(
      userId,
      `Routine created by ${roleLabel}: ${routine.title}`,
      `Routine "${routine.title}" was created for you`,
      'other',
      { routineId: routine._id, createdBy: therapistId }
    );

    const populated = await Routine.findById(routine._id).lean();
    populated.tasks = await Task.find({ routine: routine._id }).sort({ order: 1 }).lean();
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a routine for a user (for therapists/caregivers or admin)
exports.deleteUserRoutine = async (req, res) => {
  try {
    const { userId, routineId } = req.params;
    const therapistId = req.user._id;
    const isAdmin = req.user.role?.name === 'admin';

    if (!isAdmin) {
      const assignment = await UserAssignment.findOne({
        userId,
        relatedUserId: therapistId,
        isActive: true
      });
      if (!assignment) {
        return res.status(403).json({ error: 'Not authorized to delete routines for this user' });
      }
      const isTherapist = req.user.role?.name === 'therapist';
      const canModify = isTherapist || assignment.permissions?.canOverrideSettings;
      if (!canModify) {
        return res.status(403).json({ error: 'You do not have permission to delete routines' });
      }
    }

    const routine = await Routine.findById(routineId);
    if (!routine || !routine.user.equals(userId)) {
      return res.status(404).json({ error: 'Routine not found' });
    }

    await Task.deleteMany({ routine: routineId });
    await Routine.findByIdAndDelete(routineId);

    const roleLabel = isAdmin ? 'admin' : (req.user.role?.name === 'therapist' ? 'therapist' : 'caregiver');
    await Activity.logActivity(
      userId,
      `Routine deleted by ${roleLabel}: ${routine.title}`,
      `Routine "${routine.title}" was removed`,
      'other',
      { routineId, deletedBy: therapistId }
    );

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a task for a user's routine (for therapists/caregivers or admin)
exports.createUserTask = async (req, res) => {
  try {
    const { userId } = req.params;
    const therapistId = req.user._id;
    const { routine: routineId, name, description, scheduledTime, estimatedDuration, completionCriteria, order } = req.body;
    const isAdmin = req.user.role?.name === 'admin';

    if (!isAdmin) {
      const assignment = await UserAssignment.findOne({
        userId,
        relatedUserId: therapistId,
        isActive: true
      });
      if (!assignment) {
        return res.status(403).json({ error: 'Not authorized' });
      }
      const isTherapist = req.user.role?.name === 'therapist';
      const canModify = isTherapist || assignment.permissions?.canOverrideSettings;
      if (!canModify) {
        return res.status(403).json({ error: 'Not authorized' });
      }
    }

    const routine = await Routine.findById(routineId);
    if (!routine || !routine.user.equals(userId)) {
      return res.status(404).json({ error: 'Routine not found' });
    }

    const task = new Task({
      name: name || 'Task',
      description: description || '',
      routine: routineId,
      user: userId,
      scheduledTime: scheduledTime || routine.schedule?.startTime || '09:00',
      type: 'daily',
      estimatedDuration: estimatedDuration || 15,
      completionCriteria: completionCriteria || 'manual',
      order: order ?? 0
    });
    await task.save();

    const roleLabel = isAdmin ? 'admin' : (req.user.role?.name === 'therapist' ? 'therapist' : 'caregiver');
    await Activity.logActivity(
      userId,
      `Task created by ${roleLabel}: ${task.name}`,
      `Task "${task.name}" was added to routine`,
      'other',
      { taskId: task._id, routineId, createdBy: therapistId }
    );

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a task for a user (for therapists/caregivers or admin)
exports.deleteUserTask = async (req, res) => {
  try {
    const { userId, taskId } = req.params;
    const therapistId = req.user._id;
    const isAdmin = req.user.role?.name === 'admin';

    if (!isAdmin) {
      const assignment = await UserAssignment.findOne({
        userId,
        relatedUserId: therapistId,
        isActive: true
      });
      if (!assignment) {
        return res.status(403).json({ error: 'Not authorized' });
      }
      const isTherapist = req.user.role?.name === 'therapist';
      const canModify = isTherapist || assignment.permissions?.canOverrideSettings;
      if (!canModify) {
        return res.status(403).json({ error: 'Not authorized' });
      }
    }

    const task = await Task.findById(taskId);
    if (!task || !task.user.equals(userId)) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await Task.findByIdAndDelete(taskId);

    const roleLabel = isAdmin ? 'admin' : (req.user.role?.name === 'therapist' ? 'therapist' : 'caregiver');
    await Activity.logActivity(
      userId,
      `Task deleted by ${roleLabel}: ${task.name}`,
      `Task "${task.name}" was removed`,
      'other',
      { taskId, deletedBy: therapistId }
    );

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get routines for a specific user (for caregivers/therapists with permission, or admin)
exports.getUserRoutines = async (req, res) => {
  try {
    const { userId } = req.params;
    const caregiverId = req.user._id;
    const isAdmin = req.user.role?.name === 'admin';
    let assignment = null;

    if (!isAdmin) {
      assignment = await UserAssignment.findOne({
        userId: userId,
        relatedUserId: caregiverId,
        isActive: true
      });
      if (!assignment) {
        return res.status(403).json({ error: 'Not authorized to view this user\'s routines' });
      }
    }

    const isTherapist = req.user.role?.name === 'therapist';
    const canAccess = isAdmin || isTherapist || assignment?.permissions?.canOverrideSettings;
    if (!canAccess) {
      return res.status(403).json({ error: 'You do not have permission to view routines' });
    }
    
    const routines = await Routine.find({ user: userId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    
    // Fetch tasks for each routine
    for (const routine of routines) {
      const tasks = await Task.find({ routine: routine._id })
        .sort({ order: 1, scheduledTime: 1 })
        .lean();
      routine.tasks = tasks;
    }
    
    res.json(routines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single routine with tasks for a user (for caregivers or admin)
exports.getUserRoutineById = async (req, res) => {
  try {
    const { userId, routineId } = req.params;
    const caregiverId = req.user._id;
    const isAdmin = req.user.role?.name === 'admin';

    if (!isAdmin) {
      const assignment = await UserAssignment.findOne({
        userId: userId,
        relatedUserId: caregiverId,
        isActive: true
      });
      const isTherapist = req.user.role?.name === 'therapist';
      const canAccess = assignment && (isTherapist || assignment.permissions?.canOverrideSettings);
      if (!canAccess) {
        return res.status(403).json({ error: 'Not authorized' });
      }
    }
    
    const routine = await Routine.findById(routineId).lean();
    if (!routine || !routine.user.equals(userId)) {
      return res.status(404).json({ error: 'Routine not found' });
    }
    
    const tasks = await Task.find({ routine: routineId })
      .sort({ order: 1, scheduledTime: 1 })
      .lean();
    
    routine.tasks = tasks;
    res.json(routine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a task for a user (for caregivers or admin)
exports.updateUserTask = async (req, res) => {
  try {
    const { userId, taskId } = req.params;
    const caregiverId = req.user._id;
    const isAdmin = req.user.role?.name === 'admin';

    if (!isAdmin) {
      const assignment = await UserAssignment.findOne({
        userId: userId,
        relatedUserId: caregiverId,
        isActive: true
      });
      const isTherapist = req.user.role?.name === 'therapist';
      const canAccess = assignment && (isTherapist || assignment.permissions?.canOverrideSettings);
      if (!canAccess) {
        return res.status(403).json({ error: 'Not authorized' });
      }
    }
    
    const task = await Task.findById(taskId);
    if (!task || !task.user.equals(userId)) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const allowedFields = ['name', 'description', 'scheduledTime', 'priority', 'estimatedDuration', 'order', 'completionCriteria'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    const updatedTask = await Task.findByIdAndUpdate(taskId, updates, { new: true });
    const roleLabel = isAdmin ? 'admin' : (req.user.role?.name === 'therapist' ? 'therapist' : 'caregiver');

    await Activity.logActivity(
      userId,
      `Task updated by ${roleLabel}: ${updatedTask.name}`,
      `Task "${updatedTask.name}" was modified by ${roleLabel}`,
      'other',
      { taskId: updatedTask._id, updatedBy: caregiverId }
    );
    
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a routine for a user (for therapists/caregivers with permission, or admin)
exports.updateUserRoutine = async (req, res) => {
  try {
    const { userId, routineId } = req.params;
    const caregiverId = req.user._id;
    const isAdmin = req.user.role?.name === 'admin';

    if (!isAdmin) {
      const assignment = await UserAssignment.findOne({
        userId: userId,
        relatedUserId: caregiverId,
        isActive: true
      });
      if (!assignment) {
        return res.status(403).json({ error: 'Not authorized to modify this user\'s routines' });
      }
      const isTherapist = req.user.role?.name === 'therapist';
      const canModify = isTherapist || assignment.permissions?.canOverrideSettings;
      if (!canModify) {
        return res.status(403).json({ error: 'You do not have permission to modify routines' });
      }
    }
    
    const routine = await Routine.findById(routineId);
    if (!routine) {
      return res.status(404).json({ error: 'Routine not found' });
    }
    
    // Verify routine belongs to the specified user
    if (!routine.user.equals(userId)) {
      return res.status(403).json({ error: 'Routine does not belong to this user' });
    }
    
    const updatedRoutine = await Routine.findByIdAndUpdate(routineId, req.body, { new: true });
    const roleLabel = isAdmin ? 'admin' : (req.user.role?.name === 'therapist' ? 'therapist' : 'caregiver');

    await Activity.logActivity(
      userId,
      `Routine updated by ${roleLabel}: ${updatedRoutine.title}`,
      `Routine "${updatedRoutine.title}" was updated by ${roleLabel}`,
      'other',
      { routineId: updatedRoutine._id, updatedBy: caregiverId }
    );
    
    res.json(updatedRoutine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Activate a routine for a user (for therapists/caregivers with permission, or admin)
exports.activateUserRoutine = async (req, res) => {
  try {
    const { userId, routineId } = req.params;
    const caregiverId = req.user._id;
    const isAdmin = req.user.role?.name === 'admin';

    if (!isAdmin) {
      const assignment = await UserAssignment.findOne({
        userId: userId,
        relatedUserId: caregiverId,
        isActive: true
      });
      if (!assignment) {
        return res.status(403).json({ error: 'Not authorized to modify this user\'s routines' });
      }
      const isTherapist = req.user.role?.name === 'therapist';
      const canModify = isTherapist || assignment.permissions?.canOverrideSettings;
      if (!canModify) {
        return res.status(403).json({ error: 'You do not have permission to modify routines' });
      }
    }
    
    const routine = await Routine.findById(routineId);
    if (!routine) {
      return res.status(404).json({ error: 'Routine not found' });
    }
    
    if (!routine.user.equals(userId)) {
      return res.status(403).json({ error: 'Routine does not belong to this user' });
    }
    
    // Mark routine as active
    await routine.activate();
    
    // Set user's activeRoutine
    const user = await User.findById(userId);
    if (user) {
      await user.setActiveRoutine(routine._id);
    }
    
    const roleLabel = isAdmin ? 'admin' : (req.user.role?.name === 'therapist' ? 'therapist' : 'caregiver');
    await Activity.logActivity(
      userId,
      `Routine activated by ${roleLabel}: ${routine.title}`,
      `Routine "${routine.title}" was set as active by ${roleLabel}`,
      'routine_activated',
      { routineId: routine._id, activatedBy: caregiverId }
    );
    
    res.json({ message: 'Routine set as active', routine });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
