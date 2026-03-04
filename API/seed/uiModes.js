
const UiMode = require('../models/UiMode');

const seedUiModes = async () => {
  const modes = [
    {
      id: 1,
      name: 'Light Mode',
      description: 'Default light UI',
      category: 'light',
      isDefault: true,
      isActive: true,
      targetAudience: ['general', 'neurodivergent'],
      sortOrder: 1,
      previewImage: null,
      settings: {
        primaryColor: '#4F46E5',
        secondaryColor: '#7C3AED',
        backgroundColor: '#FAFAFA',
        textColor: '#1F2937',
        accentColor: '#10B981',
        fontSize: 'medium',
        fontFamily: 'system-ui',
        fontWeight: 'normal',
        density: 'comfortable',
        borderRadius: 'medium',
        highContrast: false,
        reducedMotion: false,
        focusIndicators: true,
        showCompletedTasks: true,
        taskGrouping: 'time',
        reminderStyle: 'moderate'
      }
    },
    {
      id: 2,
      name: 'Dark Mode',
      description: 'Dark background for visual ease',
      category: 'dark',
      isDefault: false,
      isActive: true,
      targetAudience: ['general', 'neurodivergent', 'adhd'],
      sortOrder: 2,
      previewImage: null,
      settings: {
        primaryColor: '#818CF8',
        secondaryColor: '#A78BFA',
        backgroundColor: '#111827',
        textColor: '#F9FAFB',
        accentColor: '#34D399',
        fontSize: 'medium',
        fontFamily: 'system-ui',
        fontWeight: 'normal',
        density: 'comfortable',
        borderRadius: 'medium',
        highContrast: false,
        reducedMotion: false,
        focusIndicators: true,
        showCompletedTasks: true,
        taskGrouping: 'time',
        reminderStyle: 'moderate'
      }
    },
    {
      id: 3,
      name: 'High Contrast',
      description: 'Enhanced contrast for visibility',
      category: 'high-contrast',
      isDefault: false,
      isActive: true,
      targetAudience: ['neurodivergent', 'dyslexia', 'general'],
      sortOrder: 3,
      previewImage: null,
      settings: {
        primaryColor: '#0000FF',
        secondaryColor: '#7C3AED',
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
        accentColor: '#008000',
        fontSize: 'large',
        fontFamily: 'system-ui',
        fontWeight: 'bold',
        density: 'comfortable',
        borderRadius: 'medium',
        highContrast: true,
        reducedMotion: false,
        focusIndicators: true,
        showCompletedTasks: true,
        taskGrouping: 'time',
        reminderStyle: 'prominent'
      }
    },
    {
      id: 4,
      name: 'Low Distraction',
      description: 'Minimal UI for focus',
      category: 'low-distraction',
      isDefault: false,
      isActive: true,
      targetAudience: ['neurodivergent', 'adhd', 'autism'],
      sortOrder: 4,
      previewImage: null,
      settings: {
        primaryColor: '#6B7280',
        secondaryColor: '#9CA3AF',
        backgroundColor: '#F5F5F0',
        textColor: '#374151',
        accentColor: '#6BCB77',
        fontSize: 'medium',
        fontFamily: 'system-ui',
        fontWeight: 'normal',
        density: 'spacious',
        borderRadius: 'large',
        highContrast: false,
        reducedMotion: true,
        focusIndicators: true,
        showCompletedTasks: false,
        taskGrouping: 'time',
        reminderStyle: 'subtle'
      }
    }
  ];

  const ops = modes.map(mode => ({
    updateOne: {
      filter: { id: mode.id },
      update: { $set: mode },
      upsert: true
    }
  }));

  await UiMode.bulkWrite(ops);
  console.log('UI Modes seeded');
};

module.exports = seedUiModes;
