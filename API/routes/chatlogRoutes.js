const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/chatlogController');

router.get('/:sessionId', ctrl.getBySession);
router.post('/', ctrl.create);

module.exports = router;
