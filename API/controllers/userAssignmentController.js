
const UserAssignment = require('../models/UserAssignment');
const User = require('../models/User');

// POST /api/user-assignments
exports.createAssignment = async (req, res) => {
  try {
    const { userId, relatedUserId } = req.body;
    const createdBy = req.user._id;

    // Check roles of related user
    const relatedUser = await User.findById(relatedUserId);
    if (!relatedUser) return res.status(404).json({ error: 'Related user not found' });

    if (!['therapist', 'caregiver'].includes(relatedUser.role)) {
      return res.status(400).json({ error: 'Related user must be a therapist or caregiver' });
    }

    // One therapist per user
    if (relatedUser.role === 'therapist') {
      const existing = await UserAssignment.findOne({ userId }).populate('relatedUserId');
      if (existing && existing.relatedUserId.role === 'therapist') {
        return res.status(400).json({ error: 'User already has a therapist assigned' });
      }
    }

    const newAssignment = await UserAssignment.create({ userId, relatedUserId, createdBy });
    res.status(201).json(newAssignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/user-assignments/:userId
exports.getAssignments = async (req, res) => {
  try {
    const { userId } = req.params;
    const assignments = await UserAssignment.find({ userId }).populate('relatedUserId');
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/user-assignments/:id
exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    await UserAssignment.findByIdAndDelete(id);
    res.json({ message: 'Assignment removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
