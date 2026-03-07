const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const auth = require('../middlewares/auth');
const { requireRole } = require('../middlewares/authorize');

// Apply authentication and admin role requirement to all admin routes
router.use(auth);
router.use(requireRole('admin'));

router.get('/users/reports', ctrl.getUsersReports);
router.get('/users/by-id/:userId', ctrl.getUserById);
router.get('/users/:userId/progress', ctrl.getUserProgress);
router.get('/users/:userId/routines', ctrl.getUserRoutinesWithTasks);
router.get('/users', ctrl.listUsers);
router.get('/assignments', ctrl.listAssignments);
router.get('/routines', ctrl.listRoutines);
router.put('/update-user-plan', ctrl.updateUserPlan);
router.put('/assign-role', ctrl.assignRole);
router.put('/assign-ui-mode', ctrl.assignUiMode);
router.put('/force-complete-routine', ctrl.forceRoutineComplete);
router.put('/set-active-routine', ctrl.setActiveRoutine);
router.put('/downgrade', ctrl.downgradePlan);
router.get('/ai-config', ctrl.getAIConfig);
router.put('/ai-config', ctrl.updateAIConfig);

module.exports = router;
