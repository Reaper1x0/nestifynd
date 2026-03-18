const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/planController');
const auth = require('../middlewares/auth');
const { requireRole } = require('../middlewares/authorize');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', auth, requireRole('admin'), ctrl.create);
router.put('/:id', auth, requireRole('admin'), ctrl.update);
router.delete('/:id', auth, requireRole('admin'), ctrl.delete);

module.exports = router;
