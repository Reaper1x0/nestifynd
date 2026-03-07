const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const { hasPermissions, getDefaultPermissionsForRole } = require('../utils/rolePermissions');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization');
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No token, authorization denied' 
      });
    }

    // Extract token from "Bearer <token>"
    const tokenParts = token.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token format' 
      });
    }

    const jwtToken = tokenParts[1];
    
    // Verify token
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id;

    // Get user from database with role populated
    const user = await User.findById(userId)
      .populate('role', 'name permissions')
      .populate('plan', 'name features')
      .populate('uiMode', 'name settings')
      .populate('activeRoutine', 'title isActive');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        success: false,
        message: 'Account is deactivated' 
      });
    }

    // Ensure role is a plain object so permissions are reliably readable by authorize middleware
    if (user.role && typeof user.role.toObject === 'function') {
      user.role = user.role.toObject();
    }

    // Backfill role permissions if missing (e.g. roles created before seed stored permissions)
    if (user.role && !hasPermissions(user.role)) {
      const roleName = user.role.name || 'user';
      const defaultPerms = getDefaultPermissionsForRole(roleName);
      await Role.findByIdAndUpdate(user.role._id, { $set: { permissions: defaultPerms } });
      user.role.permissions = defaultPerms;
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id;
    req.userRole = user.role?.name;
    
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ 
      success: false,
      message: 'Token is not valid' 
    });
  }
};

module.exports = auth;
