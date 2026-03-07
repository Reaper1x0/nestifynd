const User = require('../models/User');
const UserAssignment = require('../models/UserAssignment');
const { getDefaultPermissionsForRole } = require('../utils/rolePermissions');

/**
 * Middleware to check if user has specific role
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }

    const userRole = req.user.role?.name;
    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({ 
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}` 
      });
    }

    next();
  };
};

/**
 * Helper: resolve effective permission for role (from DB or default for role name)
 */
function hasPermission(role, permission) {
  if (!role) return false;
  const fromDb = role.permissions && role.permissions[permission];
  if (fromDb === true) return true;
  const defaults = getDefaultPermissionsForRole(role.name);
  return defaults[permission] === true;
}

/**
 * Middleware to check if user has specific permission
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }

    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json({ 
        success: false,
        message: `Access denied. Required permission: ${permission}` 
      });
    }

    next();
  };
};

/**
 * Middleware to check if user can access specific user's data
 */
const requireUserAccess = (paramName = 'userId') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          message: 'Authentication required' 
        });
      }

      const targetUserId = req.params[paramName];
      const currentUserId = req.user._id.toString();
      const userRole = req.user.role?.name;

      // Admin can access any user's data
      if (userRole === 'admin') {
        return next();
      }

      // User can only access their own data
      if (userRole === 'user') {
        if (targetUserId !== currentUserId) {
          return res.status(403).json({ 
            success: false,
            message: 'Access denied. You can only access your own data' 
          });
        }
        return next();
      }

      // Therapist/Caregiver can access assigned users' data
      if (userRole === 'therapist' || userRole === 'caregiver') {
        const assignment = await UserAssignment.isAssigned(
          targetUserId, 
          currentUserId, 
          userRole
        );
        
        if (!assignment) {
          return res.status(403).json({ 
            success: false,
            message: 'Access denied. User not assigned to you' 
          });
        }
        return next();
      }

      return res.status(403).json({ 
        success: false,
        message: 'Access denied' 
      });
    } catch (error) {
      console.error('User access middleware error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Internal server error' 
      });
    }
  };
};

/**
 * Middleware to check if user can manage specific user
 */
const requireUserManagement = (paramName = 'userId') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          message: 'Authentication required' 
        });
      }

      const targetUserId = req.params[paramName];
      const currentUserId = req.user._id.toString();
      const userRole = req.user.role?.name;

      // Admin can manage any user
      if (userRole === 'admin') {
        return next();
      }

      // Therapist can manage assigned users
      if (userRole === 'therapist') {
        const assignment = await UserAssignment.isAssigned(
          targetUserId, 
          currentUserId, 
          'therapist'
        );
        
        if (!assignment) {
          return res.status(403).json({ 
            success: false,
            message: 'Access denied. User not assigned to you' 
          });
        }
        return next();
      }

      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Insufficient permissions' 
      });
    } catch (error) {
      console.error('User management middleware error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Internal server error' 
      });
    }
  };
};

/**
 * Middleware to check if user can access resource
 */
const requireResourceAccess = (resourceType) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          message: 'Authentication required' 
        });
      }

      const userRole = req.user.role?.name;
      const userId = req.user._id.toString();

      // Admin can access any resource
      if (userRole === 'admin') {
        return next();
      }

      // Check if resource belongs to user
      if (resourceType === 'task' || resourceType === 'routine') {
        const resourceId = req.params.id;
        const Resource = require(`../models/${resourceType === 'task' ? 'Task' : 'Routine'}`);
        
        const resource = await Resource.findById(resourceId);
        if (!resource) {
          return res.status(404).json({ 
            success: false,
            message: 'Resource not found' 
          });
        }

        if (resource.user.toString() !== userId) {
          return res.status(403).json({ 
            success: false,
            message: 'Access denied. Resource does not belong to you' 
          });
        }
      }

      next();
    } catch (error) {
      console.error('Resource access middleware error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Internal server error' 
      });
    }
  };
};

module.exports = {
  requireRole,
  requirePermission,
  requireUserAccess,
  requireUserManagement,
  requireResourceAccess
};

