const mongoose = require('mongoose');

const routineSchema = new mongoose.Schema({
  title: { 
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
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  isActive: { 
    type: Boolean, 
    default: false 
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RoutineTemplate',
    default: null
  },
  schedule: {
    startTime: String, // Format: "HH:MM"
    endTime: String,   // Format: "HH:MM"
    daysOfWeek: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    isRecurring: {
      type: Boolean,
      default: true
    }
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
    reminderInterval: {
      type: Number,
      default: 5 // minutes
    }
  }
}, { 
  timestamps: true 
});

// Indexes for performance
routineSchema.index({ user: 1, isActive: 1 });
routineSchema.index({ createdBy: 1 });
routineSchema.index({ isTemplate: 1 });

// Pre-save middleware to ensure only one active routine per user
routineSchema.pre('save', async function(next) {
  if (this.isActive && this.isNew) {
    // Deactivate all other routines for this user
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { $set: { isActive: false } }
    );
  }
  next();
});

// Method to activate routine
routineSchema.methods.activate = async function() {
  // Deactivate all other routines for this user
  await this.constructor.updateMany(
    { user: this.user, _id: { $ne: this._id } },
    { $set: { isActive: false } }
  );
  
  // Activate this routine
  this.isActive = true;
  return this.save();
};

// Method to deactivate routine
routineSchema.methods.deactivate = async function() {
  this.isActive = false;
  return this.save();
};

// Static method to get active routine for user
routineSchema.statics.getActiveForUser = function(userId) {
  return this.findOne({ user: userId, isActive: true });
};

module.exports = mongoose.model('Routine', routineSchema);
