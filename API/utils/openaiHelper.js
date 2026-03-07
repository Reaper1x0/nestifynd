// utils/openaiHelper.js
const OpenAI = require('openai');

let cachedApiKey = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60000; // 1 minute cache

async function getApiKey() {
  const now = Date.now();
  if (cachedApiKey && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedApiKey;
  }
  
  try {
    const AIConfig = require('../models/AIConfig');
    const config = await AIConfig.findOne({ key: 'default' });
    if (config) {
      const dbKey = config.getApiKey();
      if (dbKey) {
        cachedApiKey = dbKey;
        cacheTimestamp = now;
        return dbKey;
      }
    }
  } catch (err) {
    console.error('Error fetching API key from database:', err.message);
  }
  
  if (process.env.OPENAI_API_KEY) {
    cachedApiKey = process.env.OPENAI_API_KEY;
    cacheTimestamp = now;
    return process.env.OPENAI_API_KEY;
  }
  
  return null;
}

function clearApiKeyCache() {
  cachedApiKey = null;
  cacheTimestamp = 0;
}

async function getOpenAIClient() {
  const apiKey = await getApiKey();
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

async function generateQuote(userBehavior) {
  const openai = await getOpenAIClient();
  if (!openai) {
    return "You're doing great! Keep up the good work!";
  }
  const prompt = `The user has struggled with completing this task:\n\n${userBehavior}\n\nGive an encouraging, short motivational quote.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 60
  });

  return response.choices[0].message.content.trim();
}

async function chat(messages, options = {}) {
  const openai = await getOpenAIClient();
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }
  
  const response = await openai.chat.completions.create({
    model: options.model || 'gpt-3.5-turbo',
    messages,
    max_tokens: options.max_tokens || 500,
    temperature: options.temperature || 0.7
  });
  
  return response.choices[0].message.content.trim();
}

async function isConfigured() {
  const apiKey = await getApiKey();
  return !!apiKey;
}

module.exports = {
  generateQuote,
  chat,
  getOpenAIClient,
  getApiKey,
  isConfigured,
  clearApiKeyCache
};