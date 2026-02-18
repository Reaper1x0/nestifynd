const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  action: { 
    type: String, 
    required: true,
    trim: true
  },
  details: { 
    type: String, 
    trim: true
  },
  type: {
    type: String,
    enum: ['task_completed', 'task_snoozed', 'task_dismissed', 'reminder_sent', 'routine_activated', 'routine_deactivated', 'user_login', 'user_logout', 'other'],
    default: 'other'
  },
  relatedTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  },
  relatedRoutine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Routine',
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  }
}, { 
  timestamps: true 
});

// Indexes for performance
userActivitySchema.index({ user: 1, createdAt: -1 });
userActivitySchema.index({ type: 1, createdAt: -1 });
userActivitySchema.index({ relatedTask: 1 });
userActivitySchema.index({ relatedRoutine: 1 });

// Static method to log activity
userActivitySchema.statics.logActivity = function(userId, action, details, type = 'other', metadata = {}) {
  return this.create({
    user: userId,
    action,
    details,
    type,
    metadata
  });
};

// Static method to get activities for user
userActivitySchema.statics.getUserActivities = function(userId, limit = 50, skip = 0) {
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('relatedTask', 'name scheduledTime')
    .populate('relatedRoutine', 'title');
};

// Static method to get activities by type
userActivitySchema.statics.getActivitiesByType = function(userId, type, limit = 50) {
  return this.find({ user: userId, type })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('relatedTask', 'name scheduledTime')
    .populate('relatedRoutine', 'title');
};

module.exports = mongoose.model('UserActivity', userActivitySchema);
