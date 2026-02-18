// controllers/therapistController.js
const User = require('../models/User');
const Streak = require('../models/Streak');
const Achievement = require('../models/Achievement');

exports.getClientReports = async (req, res) => {
  const therapistId = req.user.id;

  try {
    const clients = await User.find({ therapistId });

    const reports = [];

    for (const client of clients) {
      const streak = await Streak.findOne({ userId: client._id });
      const achievements = await Achievement.find({ userId: client._id }).populate('badgeId');

      reports.push({
        clientId: client._id,
        name: `${client.firstName} ${client.lastName}`,
        lastLogin: client.lastLogin,
        streak: streak ? streak.currentStreak : 0,
        longestStreak: streak ? streak.longestStreak : 0,
        badgesEarned: achievements.length,
        recentBadges: achievements.slice(-3).map(a => a.badgeId.name),
        lastCompletedTask: client.lastCompletedTaskDate || null
      });
    }

    res.json({ reports });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching reports' });
  }
};