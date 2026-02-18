const DiscountCode = require('../models/DiscountCode');

exports.getAll = async (req, res) => {
  const codes = await DiscountCode.find();
  res.json(codes);
};

exports.create = async (req, res) => {
  const code = new DiscountCode(req.body);
  await code.save();
  res.status(201).json(code);
};

exports.apply = async (req, res) => {
  const { code } = req.body;
  const discount = await DiscountCode.findOne({ code, isActive: true, expiresAt: { $gt: new Date() } });
  if (!discount) return res.status(400).json({ msg: 'Invalid or expired code' });
  res.json(discount);
};
