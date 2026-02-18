// routes/api/v1/template.route.js
const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const authMiddleware = require('../middlewares/auth');

router.get('/templates', authMiddleware, templateController.getAllTemplates);
router.get('/templates/:id', authMiddleware, templateController.getTemplateById);
router.post('/templates/:id/apply', authMiddleware, templateController.applyTemplateToUser);

module.exports = router;