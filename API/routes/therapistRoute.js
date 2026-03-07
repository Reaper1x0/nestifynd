// routes/api/v1/therapist.route.js
const express = require('express');
const router = express.Router();
const therapistController = require('../controllers/therapistController');
const authMiddleware = require('../middlewares/auth');
const { requireRole } = require('../middlewares/authorize');

router.get('/clients/reports', authMiddleware, requireRole('therapist', 'caregiver'), therapistController.getClientReports);
router.get('/lookup-client', authMiddleware, requireRole('therapist'), therapistController.lookupClientByEmail);
router.post('/clients', authMiddleware, requireRole('therapist'), therapistController.addClient);
router.get('/clients/:clientId/analytics', authMiddleware, requireRole('therapist'), therapistController.getClientAnalytics);
router.get('/clients/:clientId/progress', authMiddleware, requireRole('therapist'), therapistController.getClientProgress);
router.get('/clients/:clientId/settings', authMiddleware, requireRole('therapist'), therapistController.getClientSettings);

module.exports = router;