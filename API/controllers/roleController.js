const Role = require('../models/Role');

exports.getAll = async (req, res) => {
  const items = await Role.find();
  res.json(items);
};

exports.getById = async (req, res) => {
  const item = await Role.findById(req.params.id);
  res.json(item);
};

exports.create = async (req, res) => {
  const item = new Role(req.body);
  await item.save();
  res.status(201).json(item);
};

exports.update = async (req, res) => {
  const item = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(item);
};

exports.delete = async (req, res) => {
  await Role.findByIdAndDelete(req.params.id);
  res.status(204).send();
};
