const mongoose = require('mongoose');
const themeSchema = new mongoose.Schema({
  name: String,
  primaryColor: String,
  secondaryColor: String,
  tertiaryColor: String
}, { timestamps: true });
module.exports = mongoose.model('Theme', themeSchema);
