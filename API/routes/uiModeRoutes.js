
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/uiModeController');

router.get('/', auth, ctrl.getAllUiModes);
router.get('/uimode', auth, ctrl.getUiMode);
router.put('/uimode', auth, ctrl.updateUiMode);
router.get('/category/:category', auth, ctrl.getUiModeByCategory);
router.patch('/update', auth, ctrl.updateUserUiMode);

module.exports = router;
