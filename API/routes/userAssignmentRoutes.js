
const express = require('express');
const router = express.Router();
const {
  createAssignment,
  getAssignments,
  deleteAssignment
} = require('../controllers/userAssignmentController');
const auth = require('../middlewares/auth');

router.post('/', auth, createAssignment);
router.get('/:userId', auth, getAssignments);
router.delete('/:id', auth, deleteAssignment);

module.exports = router;
