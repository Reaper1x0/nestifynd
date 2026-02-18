// models/Badge.js
const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  criteria: {
    type: Object,
    required: true
  }, // e.g., { completedTasks: 5 }
  icon: String
});

module.exports = mongoose.model('Badge', badgeSchema);