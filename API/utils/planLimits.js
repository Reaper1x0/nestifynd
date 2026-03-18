/**
 * Plan limits utility - checks and enforces plan-based limits
 */

const Plan = require('../models/Plan');
const User = require('../models/User');
const UserAssignment = require('../models/UserAssignment');
const Routine = require('../models/Routine');
const Task = require('../models/Task');

/**
 * Get plan limits for a user (by plan ID or populated plan object)
 * @param {ObjectId|Object} planOrId - Plan document, ObjectId, or populated plan
 * @returns {Object} limits + customization
 */
async function getPlanLimits(planOrId) {
  if (!planOrId) return null;
  let plan = planOrId;
  if (plan._id && !plan.limits) {
    plan = await Plan.findById(plan._id).select('limits customization name').lean();
  } else if (plan.toString && plan.toString().match(/^[a-f\d]{24}$/i)) {
    plan = await Plan.findById(plan).select('limits customization name').lean();
  }
  if (!plan) return null;
  const limits = plan.limits || {};
  const customization = plan.customization || {};
  return {
    name: plan.name,
    limits: {
      therapist: { allowed: !!limits.therapist?.allowed, maxAllowed: limits.therapist?.maxAllowed ?? 0 },
      caregiver: { allowed: !!limits.caregiver?.allowed, maxAllowed: limits.caregiver?.maxAllowed ?? 0 },
      allowAIRoutine: limits.allowAIRoutine === true,
      allowAIChat: limits.allowAIChat === true,
      routines: limits.routines ?? 1,
      tasksPerRoutine: limits.tasksPerRoutine ?? 5
    },
    customization: {
      allowColorChanges: customization.allowColorChanges !== false,
      allowThemeChanges: customization.allowThemeChanges !== false
    }
  };
}

/**
 * Get plan limits for a user by userId
 * @param {ObjectId} userId
 * @returns {Object|null}
 */
async function getPlanLimitsForUser(userId) {
  const user = await User.findById(userId).populate('plan', 'limits customization name').lean();
  if (!user || !user.plan) return null;
  return getPlanLimits(user.plan);
}

/**
 * Check therapist assignment limit for a user (client)
 * @param {ObjectId} userId - The client user ID
 * @returns {{ allowed: boolean, current: number, max: number, planName?: string }}
 */
async function checkTherapistLimit(userId) {
  const planData = await getPlanLimitsForUser(userId);
  if (!planData) {
    return { allowed: false, current: 0, max: 0 };
  }
  const { allowed, maxAllowed } = planData.limits.therapist;
  const current = await UserAssignment.countDocuments({
    userId,
    relationshipType: 'therapist',
    isActive: true
  });
  return {
    allowed,
    current,
    max: maxAllowed,
    planName: planData.name
  };
}

/**
 * Check caregiver assignment limit for a user (client)
 * @param {ObjectId} userId - The client user ID
 * @returns {{ allowed: boolean, current: number, max: number, planName?: string }}
 */
async function checkCaregiverLimit(userId) {
  const planData = await getPlanLimitsForUser(userId);
  if (!planData) {
    return { allowed: false, current: 0, max: 0 };
  }
  const { allowed, maxAllowed } = planData.limits.caregiver;
  const current = await UserAssignment.countDocuments({
    userId,
    relationshipType: 'caregiver',
    isActive: true
  });
  return {
    allowed,
    current,
    max: maxAllowed,
    planName: planData.name
  };
}

/**
 * Check routines limit for a user
 * @param {ObjectId} userId
 * @returns {{ allowed: boolean, current: number, max: number, planName?: string }}
 */
async function checkRoutinesLimit(userId) {
  const planData = await getPlanLimitsForUser(userId);
  if (!planData) {
    return { allowed: false, current: 0, max: 1 };
  }
  const maxRoutines = planData.limits.routines ?? 1;
  const current = await Routine.countDocuments({ user: userId });
  const allowed = current < maxRoutines;
  return {
    allowed,
    current,
    max: maxRoutines,
    planName: planData.name
  };
}

/**
 * Check tasks-per-routine limit
 * @param {ObjectId} routineId
 * @returns {{ allowed: boolean, current: number, max: number, planName?: string }}
 */
async function checkTasksLimit(routineId) {
  const routine = await Routine.findById(routineId).populate('user').lean();
  if (!routine || !routine.user) {
    return { allowed: false, current: 0, max: 5 };
  }
  const planData = await getPlanLimitsForUser(routine.user._id);
  if (!planData) {
    return { allowed: false, current: 0, max: 5 };
  }
  const maxTasks = planData.limits.tasksPerRoutine ?? 5;
  const current = await Task.countDocuments({ routine: routineId });
  const allowed = current < maxTasks;
  return {
    allowed,
    current,
    max: maxTasks,
    planName: planData.name
  };
}

/**
 * Check if user can change colors (customization)
 * @param {ObjectId} userId
 * @returns {Promise<boolean>}
 */
async function checkColorChangeAllowed(userId) {
  const planData = await getPlanLimitsForUser(userId);
  if (!planData) return true;
  return planData.customization.allowColorChanges;
}

/**
 * Check if user can change theme (customization)
 * @param {ObjectId} userId
 * @returns {Promise<boolean>}
 */
async function checkThemeChangeAllowed(userId) {
  const planData = await getPlanLimitsForUser(userId);
  if (!planData) return true;
  return planData.customization.allowThemeChanges;
}

/**
 * Check if user can use AI Routine (AI-generated routines)
 * @param {ObjectId} userId
 * @returns {Promise<boolean>}
 */
async function checkAIRoutineAllowed(userId) {
  const planData = await getPlanLimitsForUser(userId);
  if (!planData) return false;
  return planData.limits.allowAIRoutine === true;
}

/**
 * Check if user can use AI Chat (AI Assistant)
 * @param {ObjectId} userId
 * @returns {Promise<boolean>}
 */
async function checkAIChatAllowed(userId) {
  const planData = await getPlanLimitsForUser(userId);
  if (!planData) return false;
  return planData.limits.allowAIChat === true;
}

module.exports = {
  getPlanLimits,
  getPlanLimitsForUser,
  checkTherapistLimit,
  checkCaregiverLimit,
  checkRoutinesLimit,
  checkTasksLimit,
  checkColorChangeAllowed,
  checkThemeChangeAllowed,
  checkAIRoutineAllowed,
  checkAIChatAllowed
};
