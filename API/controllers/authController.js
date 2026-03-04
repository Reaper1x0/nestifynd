const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: User's password
 *                 example: "password123"
 *               role:
 *                 type: string
 *                 enum: [user, admin, therapist]
 *                 description: User's role
 *                 example: "user"
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 */
const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    
    // Get default role and plan
    const Role = require('../models/Role');
    const Plan = require('../models/Plan');
    
    const allowedRoles = ['user', 'therapist', 'caregiver'];
    const requestedRole = role && allowedRoles.includes(role) ? role : 'user';

    let userRole = await Role.findOne({ name: requestedRole });
    if (!userRole) {
      userRole = await Role.findOne({ name: 'user' });
    }
    if (!userRole) {
      userRole = new Role({ 
        name: 'user', 
        displayName: 'User',
        description: 'Standard user role',
        isDefault: true
      });
      await userRole.save();
    }
    
    // Find or create default plan (Free)
    let userPlan = await Plan.findOne({ name: 'Free' });
    if (!userPlan) {
      userPlan = new Plan({ 
        name: 'Free',
        price: 0,
        interval: 'month',
        features: ['Limited routines', 'Basic reminders']
      });
      await userPlan.save();
    }
    
    // Create user with default role and plan
    const user = new User({ 
      name, 
      email, 
      password: hashed,
      role: userRole._id,
      plan: userPlan._id
    });
    await user.save();
    
    // Populate role for the response
    await user.populate('role');

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

function sanitizeUser(user) {
  const u = user.toObject ? user.toObject() : { ...user };
  delete u.password;
  return u;
}

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 description: User's password
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 */
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).populate('role');
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      const resetToken = jwt.sign(
        { id: user._id, purpose: 'password_reset' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      console.log(`[Mock] Password reset link for ${email}: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`);
    }
    res.json({ message: 'If an account exists with this email, you will receive a reset link.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ msg: 'Invalid token or password (min 6 characters)' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.purpose !== 'password_reset') return res.status(400).json({ msg: 'Invalid token' });
    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).json({ msg: 'Invalid token' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    if (err.name === 'TokenExpiredError') return res.status(400).json({ msg: 'Reset link expired' });
    console.error('Reset password error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('-password')
      .populate('role', 'name')
      .populate('plan', 'name');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

const updateProfile = async (req, res) => {
  const { name, email, phoneNumber, emergencyContact } = req.body;
  try {
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (emergencyContact !== undefined) updateData.emergencyContact = emergencyContact;

    if (email !== undefined && email !== req.user.email) {
      const existing = await User.findOne({ email, _id: { $ne: req.userId } });
      if (existing) return res.status(400).json({ msg: 'Email already in use' });
      updateData.email = email;
    }

    const user = await User.findByIdAndUpdate(req.userId, updateData, { new: true })
      .select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    res.json({ msg: 'Profile updated', user: sanitizeUser(user) });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('settings uiMode motivationalOptIn').populate('uiMode', 'category');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    const settings = { ...(user.settings || {}) };
    if (user.uiMode?.category) {
      const m = { light: 'light', dark: 'dark', 'high-contrast': 'high-contrast', 'low-distraction': 'light' };
      settings.theme = m[user.uiMode.category] || settings.theme || 'light';
    }
    if (typeof user.motivationalOptIn === 'boolean') settings.motivationalOptIn = user.motivationalOptIn;
    res.json(settings);
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const { motivationalOptIn, ...settingsBody } = req.body;
    user.settings = { ...(user.settings || {}), ...settingsBody };
    user.markModified('settings');
    if (typeof motivationalOptIn === 'boolean') user.motivationalOptIn = motivationalOptIn;
    await user.save();

    res.json({ msg: 'Settings saved', settings: user.settings, motivationalOptIn: user.motivationalOptIn });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

const exportData = async (req, res) => {
  const { types } = req.body;
  try {
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      userId: req.userId
    };

    const allTypes = types || ['routines', 'progress', 'messages', 'settings'];

    if (allTypes.includes('settings')) {
      const user = await User.findById(req.userId).select('settings name email phoneNumber emergencyContact');
      exportPayload.settings = {
        profile: { name: user.name, email: user.email, phoneNumber: user.phoneNumber, emergencyContact: user.emergencyContact },
        preferences: user.settings || {}
      };
    }

    if (allTypes.includes('routines')) {
      const Routine = require('../models/Routine');
      const routines = await Routine.find({ user: req.userId }).lean();
      exportPayload.routines = routines;
    }

    if (allTypes.includes('progress')) {
      const UserActivity = require('../models/UserActivity');
      const activities = await UserActivity.find({ user: req.userId }).sort('-createdAt').limit(500).lean();
      exportPayload.progress = activities;
    }

    if (allTypes.includes('messages')) {
      try {
        const Message = require('../models/Message');
        const messages = await Message.find({
          $or: [{ senderId: req.userId }, { receiverId: req.userId }]
        }).sort('-createdAt').limit(500).lean();
        exportPayload.messages = messages;
      } catch {
        exportPayload.messages = [];
      }
    }

    res.json(exportPayload);
  } catch (err) {
    console.error('Export data error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`;
    user.name = 'Deleted User';
    await user.save();

    res.json({ msg: 'Account deactivated successfully' });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

module.exports = { register, login, forgotPassword, resetPassword, getProfile, updateProfile, getSettings, updateSettings, exportData, deleteAccount };
