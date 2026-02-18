const mongoose = require('mongoose');

const discountCodeSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  percentage: Number,
  expiresAt: Date,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('DiscountCode', discountCodeSchema);
