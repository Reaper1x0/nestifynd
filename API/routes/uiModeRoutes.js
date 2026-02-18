
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/uiModeController');

router.get('/uimode', auth, ctrl.getUiMode);
router.put('/uimode', auth, ctrl.updateUiMode);
router.get('/', auth, ctrl.getAllUiModes);
router.patch('/update', auth, ctrl.updateUserUiMode);

module.exports = router;
