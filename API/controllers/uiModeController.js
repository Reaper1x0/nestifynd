const UiMode = require('../models/UiMode');
const UiModePreference = require('../models/UiModePreference');
const User = require('../models/User');

exports.getAllUiModes = async (req, res) => {
  try {
    const modes = await UiMode.find({ isActive: true }).sort('id');
    res.json(modes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUiModeByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const mode = await UiMode.findOne({ category, isActive: true });
    if (!mode) return res.status(404).json({ error: 'UI mode not found' });
    res.json(mode);
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

    const user = await User.findByIdAndUpdate(req.user._id, { uiMode: uiModeId }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'UI mode updated', uiModeId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUiMode = async (req, res) => {
  const userId = req.user.id;

  try {
    let preference = await UiModePreference.findOne({ userId }).populate('uiMode');

    if (!preference) {
      const defaultMode = await UiMode.findOne({ category: 'light', isActive: true });
      if (defaultMode) {
        preference = new UiModePreference({ userId, uiMode: defaultMode._id });
        await preference.save();
        preference = await UiModePreference.findOne({ userId }).populate('uiMode');
      } else {
        preference = new UiModePreference({ userId });
        await preference.save();
      }
    }

    res.json(preference);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching UI mode' });
  }
};

exports.updateUiMode = async (req, res) => {
  const userId = req.user.id;
  const { uiModeId, customSettings } = req.body;

  try {
    let preference = await UiModePreference.findOne({ userId });

    if (!preference) {
      preference = new UiModePreference({
        userId,
        uiMode: uiModeId,
        customSettings: customSettings || {}
      });
    } else {
      if (uiModeId) preference.uiMode = uiModeId;
      if (customSettings) {
        Object.keys(customSettings).forEach(key => {
          preference.customSettings[key] = customSettings[key];
        });
        preference.markModified('customSettings');
      }
      preference.lastUpdated = Date.now();
    }

    await preference.save();

    // Keep User.uiMode in sync so Admin Dashboard displays the correct UI mode
    if (uiModeId) {
      await User.findByIdAndUpdate(userId, { uiMode: uiModeId });
    } else {
      await User.findByIdAndUpdate(userId, { $unset: { uiMode: 1 } });
    }

    preference = await UiModePreference.findOne({ userId }).populate('uiMode');

    res.json(preference);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating UI mode' });
  }
};
