// routes/api/v1/gamification.route.js
const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamificationController');
const authMiddleware = require('../middlewares/auth');

router.get('/stats', authMiddleware, gamificationController.getUserStats);
router.get('/progress', authMiddleware, gamificationController.getProgress);
router.post('/task/:taskId/check', authMiddleware, gamificationController.checkTaskCompletion);
router.post('/rewards/redeem', authMiddleware, gamificationController.redeemReward);

module.exports = router;