const AiSession = require('../models/AiSession');

exports.getAll = async (req, res) => {
  const items = await AiSession.find().populate('user');
  res.json(items);
};

exports.create = async (req, res) => {
  const item = new AiSession(req.body);
  await item.save();
  res.status(201).json(item);
};
// controllers/aiController.js
const OpenAI = require('openai');
const AiChatMessage = require('../models/AiChatMessage');
const RoutineTemplate = require('../models/RoutineTemplate');

// Initialize OpenAI only if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

exports.chatWithAI = async (req, res) => {
  const { message } = req.body;
  const userId = req.user.id;

  if (!openai) {
    return res.status(503).json({ message: 'AI service not configured. Please set OPENAI_API_KEY environment variable.' });
  }

  try {
    const history = await AiChatMessage.find({ userId }).sort({ timestamp: 1 });

    const messages = [
      { role: 'system', content: 'You are an assistant that helps neurodivergent users create routines and stay motivated.' },
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages
    });

    const assistantMessage = completion.choices[0].message.content;

    await AiChatMessage.create([
      { userId, role: 'user', content: message },
      { userId, role: 'assistant', content: assistantMessage }
    ]);

    res.json({ reply: assistantMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error communicating with AI' });
  }
};

exports.suggestRoutine = async (req, res) => {
  const { prompt } = req.body;
  const userId = req.user.id;

  if (!openai) {
    return res.status(503).json({ message: 'AI service not configured. Please set OPENAI_API_KEY environment variable.' });
  }

  try {
    const systemPrompt = `
You are a helpful AI assistant for neurodivergent users.
Based on the following input, suggest a structured routine with tasks and reminders.
Format it as JSON:
{
  "name": "Morning Routine",
  "description": "Start the day smoothly",
  "tasks": [
    { "name": "Wake up", "durationMinutes": 10, "order": 1 },
    { "name": "Brush teeth", "durationMinutes": 5, "order": 2 }
  ]
}
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ]
    });

    const suggestedRoutine = JSON.parse(completion.choices[0].message.content);

    // Optionally save as draft or template
    res.json(suggestedRoutine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating routine' });
  }
};