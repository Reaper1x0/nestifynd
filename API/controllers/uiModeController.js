
const UiMode = require('../models/UiMode');
const User = require('../models/User');

exports.getAllUiModes = async (req, res) => {
  try {
    const modes = await UiMode.find().sort('id');
    res.json(modes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUserUiMode = async (req, res) => {
  try {
    const { uiModeId } = req.body;
    if (!uiModeId) {
      return res.status(400).json({ error: 'uiModeId is required' });
    }

    const user = await User.findByIdAndUpdate(req.user._id, { uiModeId }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'UI mode updated', uiModeId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUiMode = async (req, res) => {
  const userId = req.user.id;

  try {
    let preference = await UiModePreference.findOne({ userId });

    if (!preference) {
      // Create default preference if not exists
      preference = new UiModePreference({ userId });
      await preference.save();
    }

    res.json(preference);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching UI mode' });
  }
};

exports.updateUiMode = async (req, res) => {
  const userId = req.user.id;
  const updates = req.body;

  try {
    let preference = await UiModePreference.findOne({ userId });

    if (!preference) {
      preference = new UiModePreference({ userId, ...updates });
    } else {
      Object.keys(updates).forEach(key => {
        if (preference.schema.path(key)) {
          preference[key] = updates[key];
        }
      });
      preference.lastUpdated = Date.now();
    }

    await preference.save();

    res.json(preference);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating UI mode' });
  }
};