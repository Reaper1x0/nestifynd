// routes/api/v1/therapist.route.js
const express = require('express');
const router = express.Router();
const therapistController = require('../controllers/therapistController');
const authMiddleware = require('../middlewares/auth');

router.get('/clients/reports', authMiddleware, therapistController.getClientReports);

module.exports = router;