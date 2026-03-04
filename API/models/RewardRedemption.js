const mongoose = require('mongoose');

const rewardRedemptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rewardId: {
    type: String,
    required: true
  },
  rewardTitle: {
    type: String,
    required: true
  },
  cost: {
    type: Number,
    required: true
  }
}, { timestamps: true });

rewardRedemptionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('RewardRedemption', rewardRedemptionSchema);
