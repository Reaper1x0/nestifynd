
const Task = require('../models/Task');
const Routine = require('../models/Routine');
const Activity = require('../models/UserActivity');
const UserAssignment = require('../models/UserAssignment');
const User = require('../models/User');

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
    
    // Get tasks for user's active routine only
    const tasks = await Task.getTasksForActiveRoutine(userId);
    
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
    const userId = req.user._id;
    
    const task = await Task.findById(id).populate('routine');
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Check if task belongs to user
    if (!task.user.equals(userId)) {
      return res.status(403).json({ error: 'Unauthorized to update this task' });
    }

    // Check if task's routine is active
    if (!task.routine || !task.routine.isActive) {
      return res.status(403).json({ error: 'Cannot update task for inactive routine' });
    }

    // Use the new model method
    await task.markCompleted();
    
    // Log activity
    await Activity.logActivity(
      userId,
      `Task completed: ${task.name}`,
      `Task "${task.name}" was marked as completed`,
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
    const userId = req.user._id;
    const { minutes = 5 } = req.body;
    
    const task = await Task.findById(id).populate('routine');
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Check if task belongs to user
    if (!task.user.equals(userId)) {
      return res.status(403).json({ error: 'Unauthorized to snooze this task' });
    }

    // Check if task's routine is active
    if (!task.routine || !task.routine.isActive) {
      return res.status(403).json({ error: 'Cannot snooze task for inactive routine' });
    }

    // Check if task allows snoozing
    if (!task.settings.allowSnooze) {
      return res.status(403).json({ error: 'Task does not allow snoozing' });
    }

    // Use the new model method
    await task.snooze(minutes);
    
    // Log activity
    await Activity.logActivity(
      userId,
      `Task snoozed: ${task.name}`,
      `Task "${task.name}" was snoozed for ${minutes} minutes`,
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
    const userId = req.user._id;
    
    const task = await Task.findById(id).populate('routine');
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Check if task belongs to user
    if (!task.user.equals(userId)) {
      return res.status(403).json({ error: 'Unauthorized to dismiss this task' });
    }

    // Check if task's routine is active
    if (!task.routine || !task.routine.isActive) {
      return res.status(403).json({ error: 'Cannot dismiss task for inactive routine' });
    }

    // Check if task allows dismissing
    if (!task.settings.allowDismiss) {
      return res.status(403).json({ error: 'Task does not allow dismissing' });
    }

    // Use the new model method
    await task.dismiss();
    
    // Log activity for user
    await Activity.logActivity(
      userId,
      `Task dismissed: ${task.name}`,
      `Task "${task.name}" was dismissed`,
      'task_dismissed',
      { taskId: task._id, routineId: task.routine._id }
    );

    // Notify caregivers
    const caregivers = await UserAssignment.getCaregivers(userId);
    
    for (const assignment of caregivers) {
      if (assignment.relatedUserId && assignment.permissions.canReceiveNotifications) {
        await Activity.logActivity(
          assignment.relatedUserId._id,
          `User ${req.user.name || req.user.email} dismissed task: ${task.name}`,
          `Task "${task.name}" was dismissed by user`,
          'task_dismissed',
          { taskId: task._id, userId: userId, dismissedBy: req.user.name || req.user.email }
        );
      }
    }

    res.json({ 
      message: 'Task dismissed and caregivers notified',
      task,
      dismissedAt: task.dismissedAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
