
const UiMode = require('../models/UiMode');

const seedUiModes = async () => {
  const modes = [
    { id: 1, name: 'Light Mode', description: 'Default light UI' },
    { id: 2, name: 'Dark Mode', description: 'Dark background for visual ease' },
    { id: 3, name: 'High Contrast', description: 'Enhanced contrast for visibility' },
    { id: 4, name: 'Low Distraction', description: 'Minimal UI for focus' }
  ];

  await UiMode.deleteMany({});
  await UiMode.insertMany(modes);
  console.log('UI Modes seeded');
};

module.exports = seedUiModes;
