const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  phoneNumber: {
    type: String,
    trim: true,
    default: ''
  },
  emergencyContact: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' }
  },
  role: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Role',
    required: true
  },
  plan: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Plan',
    required: true
  },
  activeRoutine: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Routine',
    default: null
  },
  uiMode: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'UiMode',
    default: null
  },
  motivationalOptIn: { 
    type: Boolean, 
    default: false 
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  settings: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { 
  timestamps: true 
});

// Index for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ activeRoutine: 1 });

// Virtual for user's role name
userSchema.virtual('roleName').get(function() {
  return this.role ? this.role.name : null;
});

// Method to check if user has specific role
userSchema.methods.hasRole = function(roleName) {
  return this.role && this.role.name === roleName;
};

// Method to set active routine (with validation)
userSchema.methods.setActiveRoutine = async function(routineId) {
  // Deactivate all other routines for this user
  await this.constructor.updateMany(
    { _id: this._id },
    { $unset: { activeRoutine: 1 } }
  );
  
  // Set the new active routine
  this.activeRoutine = routineId;
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
