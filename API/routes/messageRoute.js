// routes/api/v1/message.route.js
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middlewares/auth');

router.post('/send', authMiddleware, messageController.sendMessage);
router.get('/messages', authMiddleware, messageController.getMessages);
router.get('/unread-count', authMiddleware, messageController.getUnreadCount);
router.get('/unread-by-contact', authMiddleware, messageController.getUnreadCountsByContact);
router.put('/read/:messageId', authMiddleware, messageController.markAsRead);
router.put('/read-all/:contactId', authMiddleware, messageController.markAllAsRead);

module.exports = router;