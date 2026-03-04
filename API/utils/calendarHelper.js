// utils/calendarHelper.js
const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function getCalendarEvents(routines, tasks, startDate, endDate) {
  const start = startDate ? new Date(startDate) : new Date();
  const end = endDate ? new Date(endDate) : new Date();
  end.setHours(23, 59, 59, 999);
  const events = [];

  // Events from active routines (schedule.startTime + daysOfWeek)
  routines.forEach(routine => {
    if (!routine.isActive || !routine.schedule || !routine.schedule.startTime) return;
    const days = routine.schedule.daysOfWeek || [];
    if (days.length === 0) return;
    const [h, m] = routine.schedule.startTime.split(':').map(Number);
    let d = new Date(start);
    while (d <= end) {
      const dayName = dayNames[d.getDay()];
      if (days.includes(dayName)) {
        const eventStart = new Date(d);
        eventStart.setHours(h, m, 0, 0);
        if (eventStart >= start && eventStart <= end) {
          events.push({
            id: routine._id.toString() + eventStart.getTime(),
            title: routine.title,
            start: eventStart,
            end: new Date(eventStart.getTime() + 30 * 60000),
            type: 'routine'
          });
        }
      }
      d.setDate(d.getDate() + 1);
    }
  });

  // Events from tasks (scheduledTime = HH:MM, assume daily for range)
  tasks.forEach(task => {
    if (!task.scheduledTime) return;
    const [h, m] = task.scheduledTime.split(':').map(Number);
    let d = new Date(start);
    while (d <= end) {
      const eventStart = new Date(d);
      eventStart.setHours(h, m, 0, 0);
      if (eventStart >= start && eventStart <= end) {
        events.push({
          id: task._id.toString() + eventStart.getTime(),
          title: task.name,
          start: eventStart,
          end: new Date(eventStart.getTime() + 30 * 60000),
          type: 'task',
          completed: task.completed
        });
      }
      d.setDate(d.getDate() + 1);
    }
  });

  return events.sort((a, b) => a.start - b.start);
}

module.exports = { getCalendarEvents };
