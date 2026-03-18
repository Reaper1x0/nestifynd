
const Task = require('../models/Task');
const Routine = require('../models/Routine');
const Activity = require('../models/UserActivity');
const { checkTasksLimit } = require('../utils/planLimits');
const calculateStreak = require('../utils/streakCalculator');
const unlockBadges = require('../utils/badgeUnlocker');
const UserAssignment = require('../models/UserAssignment');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 */
exports.getAll = async (req, res) => {
  try {
    const userId = req.user._id;
    const routineId = req.query.routine;

    let tasks;
    if (routineId) {
      tasks = await Task.find({ user: userId, routine: routineId }).sort({ order: 1, scheduledTime: 1 });
    } else {
      tasks = await Task.getTasksForActiveRoutine(userId);
    }

    // Clear expired snoozes so tasks show correct state after snooze period
    await Promise.all(tasks.map((t) => t.clearExpiredSnooze()));

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 */
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const task = await Task.findById(id).populate('routine');
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    // Check if task belongs to user
    if (!task.user.equals(userId)) {
      return res.status(403).json({ error: 'Unauthorized to view this task' });
    }
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 description: Task title
 *                 example: "Complete morning routine"
 *               description:
 *                 type: string
 *                 description: Task description
 *                 example: "Brush teeth, wash face, get dressed"
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: Task due date
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 description: Task priority
 *                 example: "medium"
 *               routineId:
 *                 type: string
 *                 description: ID of the routine this task belongs to
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
exports.create = async (req, res) => {
  try {
    const userId = req.user._id;
    const { routine, ...taskData } = req.body;
    
    // Validate that routine exists and belongs to user
    const routineDoc = await Routine.findById(routine);
    if (!routineDoc) {
      return res.status(404).json({ error: 'Routine not found' });
    }
    
    if (!routineDoc.user.equals(userId)) {
      return res.status(403).json({ error: 'Unauthorized to create task for this routine' });
    }

    const tasksLimit = await checkTasksLimit(routine);
    if (!tasksLimit.allowed) {
      return res.status(403).json({
        error: tasksLimit.planName
          ? `Task limit per routine reached (${tasksLimit.current}/${tasksLimit.max}). Your ${tasksLimit.planName} plan allows ${tasksLimit.max} tasks per routine. Upgrade for more.`
          : 'Task limit per routine reached. Upgrade your plan for more tasks.'
      });
    }
    
    // Create task with user and routine
    const task = new Task({
      ...taskData,
      routine,
      user: userId
    });
    
    await task.save();
    
    // Log activity
    await Activity.logActivity(
      userId,
      `Task created: ${task.name}`,
      `Task "${task.name}" was created in routine "${routineDoc.title}"`,
      'other',
      { taskId: task._id, routineId: routineDoc._id }
    );
    
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    // Check if task belongs to user
    if (!task.user.equals(userId)) {
      return res.status(403).json({ error: 'Unauthorized to update this task' });
    }
    
    const updatedTask = await Task.findByIdAndUpdate(id, req.body, { new: true });
    
    // Log activity
    await Activity.logActivity(
      userId,
      `Task updated: ${updatedTask.name}`,
      `Task "${updatedTask.name}" was updated`,
      'other',
      { taskId: updatedTask._id, routineId: updatedTask.routine }
    );
    
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       204:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 */
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    // Check if task belongs to user
    if (!task.user.equals(userId)) {
      return res.status(403).json({ error: 'Unauthorized to delete this task' });
    }
    
    await Task.findByIdAndDelete(id);
    
    // Log activity
    await Activity.logActivity(
      userId,
      `Task deleted: ${task.name}`,
      `Task "${task.name}" was deleted`,
      'other',
      { taskId: task._id, routineId: task.routine }
    );
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @swagger
 * /api/tasks/{id}/toggle-complete:
 *   patch:
 *     summary: Toggle task completion status
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task completion status toggled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Task updated"
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       403:
 *         description: Unauthorized or routine inactive
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
exports.toggleTaskComplete = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id;
    const isAdmin = req.user.role?.name === 'admin';

    const task = await Task.findById(id).populate('routine');
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Admin can act on any task; otherwise task must belong to user
    if (!isAdmin && !task.user.equals(currentUserId)) {
      return res.status(403).json({ error: 'Unauthorized to update this task' });
    }

    const taskOwnerId = task.user._id || task.user;

    // Check if task's routine is active
    if (!task.routine || !task.routine.isActive) {
      return res.status(403).json({ error: 'Cannot update task for inactive routine' });
    }

    // Use the new model method
    await task.markCompleted();

    // Update streak and unlock badges for the task owner (not admin)
    try {
      await calculateStreak(taskOwnerId);
      await unlockBadges(taskOwnerId);
    } catch (e) {
      console.error('Streak/badge update error:', e);
    }

    // Log activity for task owner
    await Activity.logActivity(
      taskOwnerId,
      `Task completed: ${task.name}`,
      isAdmin ? `Task "${task.name}" was marked completed by admin` : `Task "${task.name}" was marked as completed`,
      'task_completed',
      { taskId: task._id, routineId: task.routine._id }
    );

    res.json({ message: 'Task completed successfully', task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @swagger
 * /api/tasks/{id}/snooze:
 *   patch:
 *     summary: Snooze a task for 5 minutes
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task snoozed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Task snoozed for 5 mins"
 *       403:
 *         description: Unauthorized to snooze task
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
exports.snoozeTask = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id;
    const isAdmin = req.user.role?.name === 'admin';
    const { minutes = 5 } = req.body;

    const task = await Task.findById(id).populate('routine');
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Admin can act on any task; otherwise task must belong to user
    if (!isAdmin && !task.user.equals(currentUserId)) {
      return res.status(403).json({ error: 'Unauthorized to snooze this task' });
    }

    const taskOwnerId = task.user._id || task.user;

    // Check if task's routine is active
    if (!task.routine || !task.routine.isActive) {
      return res.status(403).json({ error: 'Cannot snooze task for inactive routine' });
    }

    // Check if task allows snoozing
    const settings = task.settings || {};
    if (settings.allowSnooze === false) {
      return res.status(403).json({ error: 'Task does not allow snoozing' });
    }

    // Already snoozed - do not re-snooze or log new activity
    const now = new Date();
    if (task.isSnoozed && task.snoozedUntil && task.snoozedUntil > now) {
      return res.json({
        message: 'Task is already snoozed',
        task,
        snoozedUntil: task.snoozedUntil
      });
    }

    // Use the new model method
    await task.snooze(minutes);

    // Log activity for task owner (only when actually snoozing)
    await Activity.logActivity(
      taskOwnerId,
      `Task snoozed: ${task.name}`,
      isAdmin ? `Task "${task.name}" was snoozed for ${minutes} minutes by admin` : `Task "${task.name}" was snoozed for ${minutes} minutes`,
      'task_snoozed',
      { taskId: task._id, routineId: task.routine._id, snoozeMinutes: minutes }
    );

    res.json({ 
      message: `Task snoozed for ${minutes} minutes`,
      task,
      snoozedUntil: task.snoozedUntil
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @swagger
 * /api/tasks/{id}/dismiss:
 *   patch:
 *     summary: Dismiss a task and notify caregivers
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task dismissed and caregivers notified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Task dismissed and caregiver notified"
 *       403:
 *         description: Unauthorized to dismiss task
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
exports.dismissTask = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id;
    const isAdmin = req.user.role?.name === 'admin';

    const task = await Task.findById(id).populate('routine');
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Admin can act on any task; otherwise task must belong to user
    if (!isAdmin && !task.user.equals(currentUserId)) {
      return res.status(403).json({ error: 'Unauthorized to dismiss this task' });
    }

    const taskOwnerId = task.user._id || task.user;

    // Check if task's routine is active
    if (!task.routine || !task.routine.isActive) {
      return res.status(403).json({ error: 'Cannot dismiss task for inactive routine' });
    }

    // Check if task allows dismissing
    const settings = task.settings || {};
    if (settings.allowDismiss === false) {
      return res.status(403).json({ error: 'Task does not allow dismissing' });
    }

    // Use the new model method
    await task.dismiss();

    // Log activity for task owner
    await Activity.logActivity(
      taskOwnerId,
      `Task dismissed: ${task.name}`,
      isAdmin ? `Task "${task.name}" was dismissed by admin` : `Task "${task.name}" was dismissed`,
      'task_dismissed',
      { taskId: task._id, routineId: task.routine._id }
    );

    // Notify caregivers of the task owner (activity log + email)
    const caregivers = await UserAssignment.getCaregivers(taskOwnerId);
    const taskOwner = await User.findById(taskOwnerId).select('name email').lean();
    const userName = taskOwner?.name || taskOwner?.email || 'User';
    
    for (const assignment of caregivers) {
      if (assignment.relatedUserId && assignment.permissions.canReceiveNotifications) {
        // Log activity for caregiver
        await Activity.logActivity(
          assignment.relatedUserId._id,
          `User ${userName} dismissed task: ${task.name}`,
          `Task "${task.name}" was dismissed by user`,
          'task_dismissed',
          { taskId: task._id, userId: userId, dismissedBy: userName }
        );
        
        // Send email notification to caregiver (mock service - console output)
        const caregiverEmail = assignment.relatedUserId.email;
        const caregiverName = assignment.relatedUserId.name || 'Caregiver';
        if (caregiverEmail) {
          await sendEmail(
            caregiverEmail,
            `Task Dismissed Alert - ${userName}`,
            `Hi ${caregiverName},\n\nThis is to notify you that ${userName} has dismissed the following task:\n\nTask: "${task.name}"\nRoutine: "${task.routine.title}"\nDismissed at: ${new Date().toLocaleString()}\n\nYou may want to follow up with them.\n\nBest regards,\nNestifyND Team`
          );
        }
      }
    }

    res.json({ 
      message: 'Task dismissed and caregivers notified',
      task,
      dismissedAt: task.dismissedAt,
      caregiversNotified: caregivers.filter(a => a.permissions?.canReceiveNotifications).length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
