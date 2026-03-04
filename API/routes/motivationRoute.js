// routes/api/v1/motivation.route.js
const express = require('express');
const router = express.Router();
const motivationController = require('../controllers/motivationController');
const authMiddleware = require('../middlewares/auth');

// Test quote generation (no task required)
router.get('/test-quote', authMiddleware, motivationController.testQuoteGeneration);

// Get quote for specific task
router.get('/quote/:taskId', authMiddleware, motivationController.getMotivationalQuote);

module.exports = router;