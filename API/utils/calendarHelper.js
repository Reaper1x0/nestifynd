// utils/calendarHelper.js
function getCalendarEvents(routines, tasks, startDate, endDate) {
  const start = startDate ? new Date(startDate) : new Date();
  const end = endDate ? new Date(endDate) : new Date();
  end.setHours(23, 59, 59, 999);

  const events = [];

  // Add routines
  routines.forEach(routine => {
    if (!routine.active) return;

    routine.reminders.forEach(reminder => {
      const reminderDate = new Date(reminder.time);
      if (reminderDate >= start && reminderDate <= end) {
        events.push({
          id: routine._id,
          title: routine.name,
          start: reminderDate,
          end: new Date(reminderDate.getTime() + 30 * 60000), // 30 mins
          type: 'routine'
        });
      }
    });
  });

  // Add single tasks
  tasks.forEach(task => {
    if (!task.dueDate) return;
    const taskDate = new Date(task.dueDate);
    if (taskDate >= start && taskDate <= end) {
      events.push({
        id: task._id,
        title: task.name,
        start: taskDate,
        end: new Date(taskDate.getTime() + 30 * 60000),
        type: 'task',
        completed: task.completed
      });
    }
  });

  return events;
}

module.exports = { getCalendarEvents };