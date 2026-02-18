// routes/api/v1/calendar.route.js
const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');
const authMiddleware = require('../middlewares/auth');

router.get('/events', authMiddleware, calendarController.getCalendarView);

module.exports = router;