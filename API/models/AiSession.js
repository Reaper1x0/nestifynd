const mongoose = require('mongoose');

const aiSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  goal: String,
  preferences: [String],
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('AiSession', aiSessionSchema);
