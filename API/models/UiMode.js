
const mongoose = require('mongoose');

const UiModeSchema = new mongoose.Schema({
  id: { 
    type: Number, 
    required: true, 
    unique: true 
  },
  name: { 
    type: String, 
    required: true,
    trim: true,
    unique: true
  },
  description: { 
    type: String,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    enum: ['light', 'dark', 'high-contrast', 'low-distraction', 'colorblind-friendly', 'dyslexia-friendly'],
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  targetAudience: [{
    type: String,
    enum: ['neurodivergent', 'adhd', 'autism', 'dyslexia', 'general']
  }],
  settings: {
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
    accentColor: {
      type: String,
      default: '#28a745'
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
    fontWeight: {
      type: String,
      enum: ['normal', 'medium', 'bold'],
      default: 'normal'
    },
    
    // Layout
    density: {
      type: String,
      enum: ['compact', 'comfortable', 'spacious'],
      default: 'comfortable'
    },
    borderRadius: {
      type: String,
      enum: ['none', 'small', 'medium', 'large'],
      default: 'medium'
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
    focusIndicators: {
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
  previewImage: {
    type: String,
    default: null
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
UiModeSchema.index({ id: 1 });
UiModeSchema.index({ category: 1 });
UiModeSchema.index({ isActive: 1 });
UiModeSchema.index({ isDefault: 1 });
UiModeSchema.index({ sortOrder: 1 });

// Method to check if mode is suitable for user
UiModeSchema.methods.isSuitableFor = function(audience) {
  return this.targetAudience.includes(audience) || this.targetAudience.includes('general');
};

// Method to get display settings
UiModeSchema.methods.getDisplaySettings = function() {
  return {
    colors: {
      primary: this.settings.primaryColor,
      secondary: this.settings.secondaryColor,
      background: this.settings.backgroundColor,
      text: this.settings.textColor,
      accent: this.settings.accentColor
    },
    typography: {
      fontSize: this.settings.fontSize,
      fontFamily: this.settings.fontFamily,
      fontWeight: this.settings.fontWeight
    },
    layout: {
      density: this.settings.density,
      borderRadius: this.settings.borderRadius
    },
    accessibility: {
      highContrast: this.settings.highContrast,
      reducedMotion: this.settings.reducedMotion,
      focusIndicators: this.settings.focusIndicators
    }
  };
};

// Static method to get modes by category
UiModeSchema.statics.getByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ sortOrder: 1 });
};

// Static method to get default mode
UiModeSchema.statics.getDefault = function() {
  return this.findOne({ isDefault: true, isActive: true });
};

// Static method to get modes for specific audience
UiModeSchema.statics.getForAudience = function(audience) {
  return this.find({ 
    $or: [
      { targetAudience: audience },
      { targetAudience: 'general' }
    ],
    isActive: true 
  }).sort({ sortOrder: 1 });
};

module.exports = mongoose.model('UiMode', UiModeSchema);
