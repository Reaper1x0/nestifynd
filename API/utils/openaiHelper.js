// utils/openaiHelper.js
const OpenAI = require('openai');

// Initialize OpenAI only if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

async function generateQuote(userBehavior) {
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

module.exports = generateQuote;