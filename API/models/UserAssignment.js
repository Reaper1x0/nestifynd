
const mongoose = require('mongoose');

const userAssignmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    relatedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    relationshipType: {
      type: String,
      enum: ['therapist', 'caregiver'],
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    permissions: {
      canViewTasks: {
        type: Boolean,
        default: true
      },
      canViewRoutines: {
        type: Boolean,
        default: true
      },
      canReceiveNotifications: {
        type: Boolean,
        default: true
      },
      canViewReports: {
        type: Boolean,
        default: false
      },
      canOverrideSettings: {
        type: Boolean,
        default: false
      }
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500
    }
  },
  { timestamps: true }
);

// Compound index to ensure unique relationships
userAssignmentSchema.index({ userId: 1, relatedUserId: 1, relationshipType: 1 }, { unique: true });

// Index for performance
userAssignmentSchema.index({ userId: 1, isActive: 1 });
userAssignmentSchema.index({ relatedUserId: 1, isActive: 1 });
userAssignmentSchema.index({ relationshipType: 1 });

// Method to check if assignment is valid
userAssignmentSchema.methods.isValid = function() {
  return this.isActive && this.userId && this.relatedUserId;
};

// Method to deactivate assignment
userAssignmentSchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

// Static method to get assignments for user
userAssignmentSchema.statics.getAssignmentsForUser = function(userId, relationshipType = null) {
  const query = { userId, isActive: true };
  if (relationshipType) {
    query.relationshipType = relationshipType;
  }
  return this.find(query).populate('relatedUserId', 'name email role');
};

// Static method to get users assigned to a user
userAssignmentSchema.statics.getUsersAssignedTo = function(userId, relationshipType = null) {
  const query = { relatedUserId: userId, isActive: true };
  if (relationshipType) {
    query.relationshipType = relationshipType;
  }
  return this.find(query).populate('userId', 'name email role');
};

// Static method to check if user is assigned to another user
userAssignmentSchema.statics.isAssigned = function(userId, relatedUserId, relationshipType = null) {
  const query = { userId, relatedUserId, isActive: true };
  if (relationshipType) {
    query.relationshipType = relationshipType;
  }
  return this.findOne(query);
};

// Static method to get caregivers for user
userAssignmentSchema.statics.getCaregivers = function(userId) {
  return this.getAssignmentsForUser(userId, 'caregiver');
};

// Static method to get therapists for user
userAssignmentSchema.statics.getTherapists = function(userId) {
  return this.getAssignmentsForUser(userId, 'therapist');
};

// Static method to get users under care of a therapist/caregiver
userAssignmentSchema.statics.getUsersUnderCare = function(userId, relationshipType) {
  return this.getUsersAssignedTo(userId, relationshipType);
};

module.exports = mongoose.model('UserAssignment', userAssignmentSchema);
