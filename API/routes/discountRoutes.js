const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/discountController');

router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.post('/apply', ctrl.apply);

module.exports = router;
