// controllers/calendarController.js
const Routine = require('../models/Routine');
const Task = require('../models/Task');
const { getCalendarEvents } = require('../utils/calendarHelper');

exports.getCalendarView = async (req, res) => {
  const userId = req.user._id;
  const { startDate, endDate } = req.query;

  try {
    const routines = await Routine.find({ user: userId });
    const tasks = await Task.find({ user: userId });

    const events = getCalendarEvents(routines, tasks, startDate, endDate);

    res.json({ events });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching calendar data' });
  }
};