const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  description: { 
    type: String, 
    trim: true,
    maxlength: 500
  },
  routine: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Routine',
    required: true
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  scheduledTime: { 
    type: String, 
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  },
  type: { 
    type: String, 
    enum: ['daily', 'weekly', 'one-time', 'recurring'],
    default: 'daily'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  completed: { 
    type: Boolean, 
    default: false 
  },
  completedAt: {
    type: Date,
    default: null
  },
  snoozedUntil: {
    type: Date,
    default: null
  },
  isSnoozed: {
    type: Boolean,
    default: false
  },
  isDismissed: {
    type: Boolean,
    default: false
  },
  dismissedAt: {
    type: Date,
    default: null
  },
  order: {
    type: Number,
    default: 0
  },
  estimatedDuration: {
    type: Number, // in minutes
    default: 15
  },
  settings: {
    allowSnooze: {
      type: Boolean,
      default: true
    },
    allowDismiss: {
      type: Boolean,
      default: true
    },
    reminderEnabled: {
      type: Boolean,
      default: true
    }
  }
}, { 
  timestamps: true 
});

// Indexes for performance
taskSchema.index({ routine: 1, user: 1 });
taskSchema.index({ user: 1, completed: 1 });
taskSchema.index({ scheduledTime: 1 });
taskSchema.index({ isSnoozed: 1, snoozedUntil: 1 });

// Pre-save middleware to set user from routine
taskSchema.pre('save', async function(next) {
  if (this.isNew && this.routine && !this.user) {
    const routine = await this.constructor.db.model('Routine').findById(this.routine);
    if (routine) {
      this.user = routine.user;
    }
  }
  next();
});

// Method to mark task as completed
taskSchema.methods.markCompleted = function() {
  this.completed = true;
  this.completedAt = new Date();
  this.isSnoozed = false;
  this.snoozedUntil = null;
  return this.save();
};

// Method to snooze task
taskSchema.methods.snooze = function(minutes = 5) {
  this.isSnoozed = true;
  this.snoozedUntil = new Date(Date.now() + minutes * 60000);
  return this.save();
};

// Method to dismiss task
taskSchema.methods.dismiss = function() {
  this.isDismissed = true;
  this.dismissedAt = new Date();
  this.isSnoozed = false;
  this.snoozedUntil = null;
  return this.save();
};

// Method to check if task is due
taskSchema.methods.isDue = function() {
  if (this.completed || this.isDismissed) return false;
  if (this.isSnoozed && this.snoozedUntil > new Date()) return false;
  
  const now = new Date();
  const [hours, minutes] = this.scheduledTime.split(':');
  const taskTime = new Date();
  taskTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  return now >= taskTime;
};

// Static method to get tasks for user's active routine
taskSchema.statics.getTasksForActiveRoutine = async function(userId) {
  const Routine = this.db.model('Routine');
  const activeRoutine = await Routine.getActiveForUser(userId);
  
  if (!activeRoutine) {
    return [];
  }
  
  return this.find({ 
    routine: activeRoutine._id, 
    user: userId,
    isDismissed: false 
  }).sort({ order: 1, scheduledTime: 1 });
};

module.exports = mongoose.model('Task', taskSchema);
