const UserActivity = require('../models/UserActivity');

exports.log = async (req, res) => {
  const log = new UserActivity(req.body);
  await log.save();
  res.status(201).json(log);
};

exports.getAll = async (req, res) => {
  const logs = await UserActivity.find().populate('user');
  res.json(logs);
};
