const mongoose = require('mongoose');

const chatLogSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'AiSession' },
  role: { type: String, enum: ['user', 'ai'], required: true },
  message: String
}, { timestamps: true });

module.exports = mongoose.model('ChatLog', chatLogSchema);
