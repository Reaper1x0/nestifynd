const mongoose = require('mongoose');

const uiModePreferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  uiMode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UiMode',
    required: true
  },
  customSettings: {
    // Color scheme
    primaryColor: {
      type: String,
      default: '#007bff'
    },
    secondaryColor: {
      type: String,
      default: '#6c757d'
    },
    backgroundColor: {
      type: String,
      default: '#ffffff'
    },
    textColor: {
      type: String,
      default: '#000000'
    },
    
    // Typography
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large', 'extra-large'],
      default: 'medium'
    },
    fontFamily: {
      type: String,
      default: 'system-ui'
    },
    
    // Layout
    density: {
      type: String,
      enum: ['compact', 'comfortable', 'spacious'],
      default: 'comfortable'
    },
    sidebarCollapsed: {
      type: Boolean,
      default: false
    },
    
    // Accessibility
    highContrast: {
      type: Boolean,
      default: false
    },
    reducedMotion: {
      type: Boolean,
      default: false
    },
    screenReader: {
      type: Boolean,
      default: false
    },
    
    // Notifications
    notificationSound: {
      type: Boolean,
      default: true
    },
    notificationVibration: {
      type: Boolean,
      default: true
    },
    
    // Task display
    showCompletedTasks: {
      type: Boolean,
      default: true
    },
    taskGrouping: {
      type: String,
      enum: ['none', 'time', 'priority', 'type'],
      default: 'time'
    },
    
    // Reminder settings
    reminderStyle: {
      type: String,
      enum: ['subtle', 'moderate', 'prominent'],
      default: 'moderate'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
uiModePreferenceSchema.index({ userId: 1 });
uiModePreferenceSchema.index({ uiMode: 1 });
uiModePreferenceSchema.index({ isActive: 1 });

// Method to update preference
uiModePreferenceSchema.methods.updatePreference = function(updates) {
  Object.keys(updates).forEach(key => {
    if (this.schema.path(key)) {
      this[key] = updates[key];
    }
  });
  this.lastUpdated = new Date();
  return this.save();
};

// Method to reset to default
uiModePreferenceSchema.methods.resetToDefault = function() {
  this.customSettings = {};
  this.lastUpdated = new Date();
  return this.save();
};

// Static method to get or create preference for user
uiModePreferenceSchema.statics.getOrCreateForUser = async function(userId, defaultUiModeId) {
  let preference = await this.findOne({ userId });
  
  if (!preference) {
    preference = new this({
      userId,
      uiMode: defaultUiModeId
    });
    await preference.save();
  }
  
  return preference;
};

// Static method to get active preferences
uiModePreferenceSchema.statics.getActivePreferences = function() {
  return this.find({ isActive: true }).populate('userId', 'name email').populate('uiMode', 'name description');
};

module.exports = mongoose.model('UiModePreference', uiModePreferenceSchema);