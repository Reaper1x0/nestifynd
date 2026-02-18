// models/RoutineTemplate.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  durationMinutes: { type: Number, required: true },
  order: { type: Number, required: true }
});

const routineTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  tasks: [taskSchema],
  category: { type: String, enum: ['Morning', 'Evening', 'Study', 'Work', 'Other'] }
});

module.exports = mongoose.model('RoutineTemplate', routineTemplateSchema);