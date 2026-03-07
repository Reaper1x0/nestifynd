// routes/api/v1/notification.route.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/auth');

router.get('/counts', authMiddleware, notificationController.getCounts);
router.post('/send-reminders', authMiddleware, notificationController.sendScheduledReminders);

module.exports = router;