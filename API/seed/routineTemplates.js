const RoutineTemplate = require('../models/RoutineTemplate');

const templates = [
  {
    name: 'Self-Care Sunday',
    description: 'Weekly self-care routine for mental wellness',
    category: 'Other',
    tasks: [
      { name: 'Take relaxing bath', durationMinutes: 15, order: 0 },
      { name: 'Face mask', durationMinutes: 10, order: 1 },
      { name: 'Journal writing', durationMinutes: 10, order: 2 },
      { name: 'Gentle yoga', durationMinutes: 15, order: 3 },
      { name: 'Plan upcoming week', durationMinutes: 10, order: 4 }
    ]
  },
  {
    name: 'Basic Morning Routine',
    description: 'A simple morning routine to start your day right',
    category: 'Morning',
    tasks: [
      { name: 'Wake up and stretch', durationMinutes: 5, order: 0 },
      { name: 'Brush teeth', durationMinutes: 5, order: 1 },
      { name: 'Shower', durationMinutes: 15, order: 2 },
      { name: 'Get dressed', durationMinutes: 10, order: 3 },
      { name: 'Eat breakfast', durationMinutes: 15, order: 4 },
      { name: 'Review daily goals', durationMinutes: 5, order: 5 }
    ]
  },
  {
    name: 'Evening Wind Down',
    description: 'Relaxing routine to prepare for restful sleep',
    category: 'Evening',
    tasks: [
      { name: 'Dim lights', durationMinutes: 2, order: 0 },
      { name: 'Light reading', durationMinutes: 15, order: 1 },
      { name: 'Meditation', durationMinutes: 10, order: 2 },
      { name: 'Prepare clothes for tomorrow', durationMinutes: 5, order: 3 },
      { name: 'Set phone to silent', durationMinutes: 2, order: 4 }
    ]
  },
  {
    name: 'Work Focus Session',
    description: 'Structured routine for productive work sessions',
    category: 'Work',
    tasks: [
      { name: 'Clear workspace', durationMinutes: 5, order: 0 },
      { name: 'Review priorities', durationMinutes: 5, order: 1 },
      { name: 'Deep work block', durationMinutes: 45, order: 2 },
      { name: 'Short break', durationMinutes: 5, order: 3 },
      { name: 'Email check', durationMinutes: 10, order: 4 },
      { name: 'Progress review', durationMinutes: 10, order: 5 }
    ]
  }
];

const seedRoutineTemplates = async () => {
  for (const t of templates) {
    await RoutineTemplate.findOneAndUpdate(
      { name: t.name },
      t,
      { upsert: true, new: true }
    );
  }
  console.log('Routine templates seeded');
};

module.exports = seedRoutineTemplates;
