// routes/api/v1/gamification.route.js
const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamificationController');
const authMiddleware = require('../middlewares/auth');

router.get('/stats', authMiddleware, gamificationController.getUserStats);
router.post('/task/:taskId/check', authMiddleware, gamificationController.checkTaskCompletion);

module.exports = router;