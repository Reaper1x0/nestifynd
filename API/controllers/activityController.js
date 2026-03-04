const UserActivity = require('../models/UserActivity');

exports.log = async (req, res) => {
  const body = { ...req.body, user: req.body.user || req.user._id };
  const log = new UserActivity(body);
  await log.save();
  res.status(201).json(log);
};

exports.getAll = async (req, res) => {
  const logs = await UserActivity.find().populate('user');
  res.json(logs);
};

/** Get current user's activities for Recent Activity feed */
exports.getMyActivities = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = Math.min(parseInt(req.query.limit, 10) || 30, 50);
    const activities = await UserActivity.getUserActivities(userId, limit, 0);
    res.json(activities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching activities' });
  }
};

/** Get activities for a specific user (for caregivers/therapists) */
exports.getUserActivities = async (req, res) => {
  try {
    const { userId } = req.params;
    const UserAssignment = require('../models/UserAssignment');
    
    // Verify the requester has permission to view this user's activities
    const assignment = await UserAssignment.findOne({
      userId: userId,
      relatedUserId: req.user._id,
      isActive: true
    });
    
    if (!assignment) {
      return res.status(403).json({ message: 'Not authorized to view this user\'s activities' });
    }
    
    // Check if caregiver has permission to view reports
    if (!assignment.permissions?.canViewReports) {
      return res.status(403).json({ message: 'You do not have permission to view progress' });
    }
    
    const limit = Math.min(parseInt(req.query.limit, 10) || 30, 50);
    const activities = await UserActivity.getUserActivities(userId, limit, 0);
    res.json(activities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching activities' });
  }
};
