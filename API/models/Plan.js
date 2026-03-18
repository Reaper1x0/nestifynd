// models/Plan.js
const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  interval: {
    type: String,
    enum: ['month', 'year'],
    default: 'month'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  features: {
    type: [String],
    default: []
  },
  stripePriceId: {
    type: String,
    default: null
  },
  limits: {
    therapist: {
      allowed: { type: Boolean, default: false },
      maxAllowed: { type: Number, default: 0 }
    },
    caregiver: {
      allowed: { type: Boolean, default: false },
      maxAllowed: { type: Number, default: 0 }
    },
    allowAIRoutine: { type: Boolean, default: false },
    allowAIChat: { type: Boolean, default: false },
    routines: {
      type: Number,
      default: 1,
      min: 0
    },
    tasksPerRoutine: {
      type: Number,
      default: 5,
      min: 0
    }
  },
  customization: {
    allowColorChanges: { type: Boolean, default: true },
    allowThemeChanges: { type: Boolean, default: true }
  }
}, { timestamps: true });

planSchema.index({ name: 1 });
planSchema.index({ isActive: 1 });

module.exports = mongoose.model('Plan', planSchema);
