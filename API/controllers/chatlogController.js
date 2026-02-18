const ChatLog = require('../models/ChatLog');

exports.getBySession = async (req, res) => {
  const items = await ChatLog.find({ session: req.params.sessionId }).sort({ createdAt: 1 });
  res.json(items);
};

exports.create = async (req, res) => {
  const item = new ChatLog(req.body);
  await item.save();
  res.status(201).json(item);
};
