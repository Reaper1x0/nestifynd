
const User = require('../models/User');
const Plan = require('../models/Plan');

const checkPlanAccess = (requiredFeatures = []) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id).populate('planId');
      if (!user || !user.planId) {
        return res.status(403).json({ error: 'No plan assigned or invalid user' });
      }

      const userFeatures = user.planId.features || [];

      const hasAccess = requiredFeatures.every(feature => userFeatures.includes(feature));

      if (!hasAccess) {
        return res.status(403).json({ error: 'Upgrade plan to access this feature' });
      }

      next();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
};

module.exports = checkPlanAccess;
