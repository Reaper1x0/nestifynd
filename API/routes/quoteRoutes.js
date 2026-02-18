const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/quoteController');

router.get('/random', ctrl.getRandom);

module.exports = router;
