const UserAssignment = require('../models/UserAssignment');
const User = require('../models/User');
const { checkTherapistLimit, checkCaregiverLimit } = require('../utils/planLimits');

// POST /api/user-assignments
// Supports: (1) User adds therapist/caregiver: userId=client, relatedUserId=therapist/caregiver
//           (2) Therapist adds client: userId=client, relatedUserId=therapist (createdBy=therapist)
exports.createAssignment = async (req, res) => {
  try {
    const { userId, relatedUserId } = req.body;
    const createdBy = req.user._id;
    const requesterRole = req.user?.role?.name;

    // Therapist-initiated: therapist adds a client (relatedUserId = therapist, or omitted)
    const isTherapistAddingClient = requesterRole === 'therapist' &&
      userId &&
      (!relatedUserId || String(relatedUserId) === String(createdBy));

    let effectiveRelatedUserId = relatedUserId;
    let effectiveUserId = userId;
    let relationshipType = null;

    if (isTherapistAddingClient) {
      effectiveRelatedUserId = createdBy;
      effectiveUserId = userId;
      const clientUser = await User.findById(userId).populate('role');
      if (!clientUser) return res.status(404).json({ error: 'User not found' });
      const clientRole = clientUser.role?.name;
      if (clientRole !== 'user') {
        return res.status(400).json({ error: 'Can only add users (clients). That account is a therapist or caregiver.' });
      }
      relationshipType = 'therapist';
    } else {
      const relatedUser = await User.findById(relatedUserId).populate('role');
      if (!relatedUser) return res.status(404).json({ error: 'Related user not found' });

      const roleName = relatedUser.role && relatedUser.role.name ? relatedUser.role.name : null;
      if (!roleName || !['therapist', 'caregiver'].includes(roleName)) {
        return res.status(400).json({ error: 'Related user must be a therapist or caregiver' });
      }
      relationshipType = roleName;
    }

    // Plan-based limits: check the client's (effectiveUserId) plan
    if (relationshipType === 'therapist') {
      const limit = await checkTherapistLimit(effectiveUserId);
      if (!limit.allowed) {
        return res.status(403).json({
          error: limit.planName
            ? `Therapist assignments are not included in the ${limit.planName} plan. Upgrade to Basic or Premium to add a therapist.`
            : 'Therapist assignments are not allowed for this plan.'
        });
      }
      if (limit.current >= limit.max) {
        return res.status(403).json({
          error: limit.max === 1
            ? `Therapist limit reached. Your ${limit.planName || 'plan'} allows 1 therapist. Upgrade to add another.`
            : `Therapist limit reached (${limit.current}/${limit.max}). Upgrade your plan for more.`
        });
      }
    }

    if (relationshipType === 'caregiver') {
      const limit = await checkCaregiverLimit(effectiveUserId);
      if (!limit.allowed) {
        return res.status(403).json({
          error: limit.planName
            ? `Caregiver assignments are not included in the ${limit.planName} plan. Upgrade to Premium to add a caregiver.`
            : 'Caregiver assignments are not allowed for this plan.'
        });
      }
      if (limit.current >= limit.max) {
        return res.status(403).json({
          error: limit.max === 1
            ? `Caregiver limit reached. Your ${limit.planName || 'plan'} allows 1 caregiver. Upgrade for more.`
            : `Caregiver limit reached (${limit.current}/${limit.max}). Upgrade your plan for more.`
        });
      }
    }

    // Remove any existing assignment (e.g. inactive from a prior downgrade) so re-add after upgrade works
    await UserAssignment.deleteMany({
      userId: effectiveUserId,
      relatedUserId: effectiveRelatedUserId,
      relationshipType
    });

    const newAssignment = await UserAssignment.create({
      userId: effectiveUserId,
      relatedUserId: effectiveRelatedUserId,
      createdBy,
      relationshipType
    });
    res.status(201).json(newAssignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/user-assignments/:userId
exports.getAssignments = async (req, res) => {
  try {
    const { userId } = req.params;
    const assignments = await UserAssignment.find({ userId, isActive: true }).populate('relatedUserId');
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/user-assignments/:id
exports.updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;
    const assignment = await UserAssignment.findById(id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    if (permissions) {
      const permMap = {
        view_progress: 'canViewReports',
        send_messages: 'canReceiveNotifications',
        modify_routines: 'canOverrideSettings'
      };
      Object.entries(permissions).forEach(([key, value]) => {
        const modelKey = permMap[key] || key;
        if (assignment.permissions[modelKey] !== undefined) {
          assignment.permissions[modelKey] = value;
        }
      });
      assignment.markModified('permissions');
    }

    await assignment.save();
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/user-assignments/my-users — get users assigned TO the current therapist/caregiver
exports.getMyUsers = async (req, res) => {
  try {
    const myId = req.user._id;
    const assignments = await UserAssignment.find({
      relatedUserId: myId,
      isActive: true
    }).populate('userId', 'name email');
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/user-assignments/lookup?email=...&role=therapist|caregiver
exports.lookupByEmail = async (req, res) => {
  try {
    const { email, role: roleFilter } = req.query;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() }).populate('role');
    if (!user) return res.status(404).json({ error: 'No user found with that email' });

    const roleName = user.role?.name;
    if (!roleName || !['therapist', 'caregiver'].includes(roleName)) {
      return res.status(400).json({ error: 'That user is not a therapist or caregiver' });
    }

    // Optional role filter: only return if user matches requested role
    if (roleFilter && roleName !== roleFilter) {
      return res.status(400).json({
        error: roleFilter === 'therapist'
          ? 'That user is not a therapist. Use Add Caregiver for caregivers.'
          : 'That user is not a caregiver. Use Add Therapist for therapists.'
      });
    }

    res.json({ id: user._id, name: user.name, email: user.email, role: roleName });
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
