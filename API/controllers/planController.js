const Plan = require('../models/Plan');

exports.getAll = async (req, res) => {
  try {
    const items = await Plan.find().sort({ price: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await Plan.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Plan not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

function normalizePlanBody(body) {
  const doc = {
    name: body.name,
    price: body.price ?? 0,
    interval: body.interval || 'month',
    isActive: body.isActive !== false,
    features: Array.isArray(body.features) ? body.features : [],
    stripePriceId: body.stripePriceId || null,
    limits: {
      therapist: {
        allowed: !!body.limits?.therapist?.allowed,
        maxAllowed: Math.max(0, parseInt(body.limits?.therapist?.maxAllowed, 10) || 0)
      },
      caregiver: {
        allowed: !!body.limits?.caregiver?.allowed,
        maxAllowed: Math.max(0, parseInt(body.limits?.caregiver?.maxAllowed, 10) || 0)
      },
      allowAIRoutine: !!body.limits?.allowAIRoutine,
      allowAIChat: !!body.limits?.allowAIChat,
      routines: Math.max(0, parseInt(body.limits?.routines, 10) || 1),
      tasksPerRoutine: Math.max(0, parseInt(body.limits?.tasksPerRoutine, 10) || 5)
    },
    customization: {
      allowColorChanges: body.customization?.allowColorChanges !== false,
      allowThemeChanges: body.customization?.allowThemeChanges !== false
    }
  };
  return doc;
}

exports.create = async (req, res) => {
  try {
    const doc = normalizePlanBody(req.body);
    const existing = await Plan.findOne({ name: doc.name });
    if (existing) return res.status(400).json({ error: `Plan with name "${doc.name}" already exists` });
    const item = new Plan(doc);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    const doc = normalizePlanBody({ ...plan.toObject(), ...req.body });
    if (doc.name !== plan.name) {
      const existing = await Plan.findOne({ name: doc.name, _id: { $ne: plan._id } });
      if (existing) return res.status(400).json({ error: `Plan with name "${doc.name}" already exists` });
    }
    Object.assign(plan, doc);
    await plan.save();
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    const freePlan = await Plan.findOne({ name: 'Free' });
    if (freePlan && plan._id.equals(freePlan._id)) {
      return res.status(400).json({ error: 'Cannot delete the Free plan' });
    }
    await Plan.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
