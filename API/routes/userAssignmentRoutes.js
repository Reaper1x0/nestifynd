
const express = require('express');
const router = express.Router();
const {
  createAssignment,
  getAssignments,
  updateAssignment,
  deleteAssignment,
  lookupByEmail,
  getMyUsers
} = require('../controllers/userAssignmentController');
const auth = require('../middlewares/auth');

router.get('/lookup', auth, lookupByEmail);
router.get('/my-users', auth, getMyUsers);
router.post('/', auth, createAssignment);
router.get('/:userId', auth, getAssignments);
router.put('/:id', auth, updateAssignment);
router.delete('/:id', auth, deleteAssignment);

module.exports = router;
