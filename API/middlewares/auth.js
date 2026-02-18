const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');

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
    
    // Get user from database with role populated
    const user = await User.findById(decoded.userId)
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
