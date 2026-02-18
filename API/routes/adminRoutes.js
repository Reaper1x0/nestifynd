const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const auth = require('../middlewares/auth');
const { requireRole } = require('../middlewares/authorize');

// Apply authentication and admin role requirement to all admin routes
router.use(auth);
router.use(requireRole('admin'));

router.put('/update-user-plan', ctrl.updateUserPlan);
router.put('/force-complete-routine', ctrl.forceRoutineComplete);
router.put('/downgrade', ctrl.downgradePlan);

module.exports = router;
