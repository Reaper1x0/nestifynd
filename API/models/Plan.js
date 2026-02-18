// models/Plan.js
const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['Free', 'Pro', 'Family']
  },
  price: {
    type: Number,
    required: true
  },
  interval: {
    type: String,
    enum: ['month', 'year'],
    default: 'month'
  },
  features: {
    type: [String],
    default: []
  },
  stripePriceId: {
    type: String
  }
});

module.exports = mongoose.model('Plan', planSchema);