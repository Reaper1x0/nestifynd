const mongoose = require('mongoose');
const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'nestifynd-default-key-32-chars!';
const IV_LENGTH = 16;

function encrypt(text) {
  if (!text) return null;
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text) {
  if (!text) return null;
  try {
    const parts = text.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = parts.join(':');
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return null;
  }
}

const aiConfigSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'default' },
  quotesInRemindersEnabled: { type: Boolean, default: false },
  useAIForQuotes: { type: Boolean, default: false },
  openaiApiKeyEncrypted: { type: String, default: null },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

aiConfigSchema.methods.setApiKey = function(plainKey) {
  this.openaiApiKeyEncrypted = encrypt(plainKey);
};

aiConfigSchema.methods.getApiKey = function() {
  return decrypt(this.openaiApiKeyEncrypted);
};

aiConfigSchema.methods.getMaskedApiKey = function() {
  const key = this.getApiKey();
  if (!key) return null;
  if (key.length <= 8) return '••••••••';
  return '••••••••' + key.slice(-4);
};

aiConfigSchema.statics.encrypt = encrypt;
aiConfigSchema.statics.decrypt = decrypt;

module.exports = mongoose.model('AIConfig', aiConfigSchema);
