const Plan = require('../models/Plan');

exports.getAll = async (req, res) => {
  const items = await Plan.find();
  res.json(items);
};

exports.getById = async (req, res) => {
  const item = await Plan.findById(req.params.id);
  res.json(item);
};

exports.create = async (req, res) => {
  const item = new Plan(req.body);
  await item.save();
  res.status(201).json(item);
};

exports.update = async (req, res) => {
  const item = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(item);
};

exports.delete = async (req, res) => {
  await Plan.findByIdAndDelete(req.params.id);
  res.status(204).send();
};
