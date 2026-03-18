const AiSession = require('../models/AiSession');
const AiChatMessage = require('../models/AiChatMessage');
const RoutineTemplate = require('../models/RoutineTemplate');
const Routine = require('../models/Routine');
const Task = require('../models/Task');
const openaiHelper = require('../utils/openaiHelper');
const { checkAIChatAllowed, checkAIRoutineAllowed } = require('../utils/planLimits');

// Helper to fetch user's routine context for AI
async function getUserRoutineContext(userId) {
  try {
    // Fetch user's routines
    const routines = await Routine.find({ user: userId }).sort({ isActive: -1, createdAt: -1 }).limit(10).lean();
    
    if (routines.length === 0) {
      return {
        hasRoutines: false,
        summary: "User has no routines yet.",
        routines: [],
        activeRoutine: null
      };
    }

    // Fetch tasks for each routine
    const routineData = await Promise.all(routines.map(async (routine) => {
      const tasks = await Task.find({ routine: routine._id }).sort({ order: 1 }).lean();
      
      const completedTasks = tasks.filter(t => t.completed);
      const pendingTasks = tasks.filter(t => !t.completed && !t.isSnoozed && !t.isDismissed);
      const snoozedTasks = tasks.filter(t => t.isSnoozed);
      const dismissedTasks = tasks.filter(t => t.isDismissed);
      
      return {
        id: routine._id.toString(),
        name: routine.title || routine.name || 'Unnamed Routine',
        description: routine.description || '',
        isActive: routine.isActive === true,
        schedule: routine.schedule || {},
        totalTasks: tasks.length,
        completedCount: completedTasks.length,
        pendingCount: pendingTasks.length,
        snoozedCount: snoozedTasks.length,
        dismissedCount: dismissedTasks.length,
        tasks: tasks.map(t => ({
          name: t.name,
          completed: t.completed,
          isSnoozed: t.isSnoozed,
          isDismissed: t.isDismissed,
          scheduledTime: t.scheduledTime,
          estimatedDuration: t.estimatedDuration
        }))
      };
    }));

    const activeRoutine = routineData.find(r => r.isActive);
    
    return {
      hasRoutines: true,
      totalRoutines: routineData.length,
      activeRoutine: activeRoutine || null,
      routines: routineData
    };
  } catch (error) {
    console.error('Error fetching user routine context:', error);
    return {
      hasRoutines: false,
      summary: "Could not fetch routine data.",
      routines: [],
      activeRoutine: null
    };
  }
}

/** Get current user's chat history for the AI assistant */
exports.getChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const isAdmin = req.user.role?.name === 'admin';
    if (!isAdmin) {
      const allowed = await checkAIChatAllowed(userId);
      if (!allowed) {
        return res.status(403).json({ message: 'AI Assistant is not included in your plan. Upgrade to Basic or Premium to use AI Chat.' });
      }
    }
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const messages = await AiChatMessage.find({ userId }).sort({ timestamp: 1 }).limit(limit).lean();
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching chat history' });
  }
};

exports.getAll = async (req, res) => {
  const items = await AiSession.find().populate('user');
  res.json(items);
};

exports.create = async (req, res) => {
  const item = new AiSession(req.body);
  await item.save();
  res.status(201).json(item);
};

exports.chatWithAI = async (req, res) => {
  const { message } = req.body;
  const userId = req.user._id;
  const isAdmin = req.user.role?.name === 'admin';
  if (!isAdmin) {
    const allowed = await checkAIChatAllowed(userId);
    if (!allowed) {
      return res.status(403).json({ message: 'AI Assistant is not included in your plan. Upgrade to Basic or Premium to use AI Chat.' });
    }
  }

  const openai = await openaiHelper.getOpenAIClient();
  if (!openai) {
    return res.status(503).json({ message: 'AI service not configured. Please set the OpenAI API key in Admin Dashboard → AI settings.' });
  }

  // Fetch user's routine data for context
  const routineContext = await getUserRoutineContext(userId);

  // Build routine context as JSON for clarity
  let userDataContext = '\n\n[USER_DATABASE_START]\n';
  
  if (routineContext.hasRoutines) {
    const dataForAI = {
      total_routines: routineContext.totalRoutines,
      routines: routineContext.routines.map(r => ({
        routine_name: r.name,
        is_active: r.isActive,
        description: r.description || '',
        total_tasks: r.totalTasks,
        completed_count: r.completedCount,
        pending_count: r.pendingCount,
        snoozed_count: r.snoozedCount,
        dismissed_count: r.dismissedCount,
        task_list: r.tasks.map((t, i) => ({
          task_number: i + 1,
          task_name: t.name,
          status: t.completed ? 'COMPLETED' : t.isSnoozed ? 'SNOOZED' : t.isDismissed ? 'DISMISSED' : 'PENDING',
          duration_minutes: t.estimatedDuration || 15
        }))
      }))
    };
    userDataContext += JSON.stringify(dataForAI, null, 2);
  } else {
    userDataContext += JSON.stringify({ total_routines: 0, routines: [], message: "User has no routines yet" }, null, 2);
  }
  
  userDataContext += '\n[USER_DATABASE_END]\n';

  const systemPrompt = `You are a helpful AI assistant for NestifyND.

ABSOLUTE RULE: When users ask about their routines or tasks, you MUST read the JSON data between [USER_DATABASE_START] and [USER_DATABASE_END] below. Use ONLY the "task_name" values from that JSON. NEVER invent, assume, or make up any task names. Copy the exact task names from the JSON.

EXAMPLE: If the JSON shows task_name: "Dim lights", you must say "Dim lights" - not "Turn off lights" or any variation.

APP NAVIGATION:
- "AI Routine" → Generate routine with AI
- "Routines" → View and manage routines
- "Dashboard" → Today's overview
- "Progress" → Achievements

WHEN ASKED ABOUT TASKS:
1. Find the routine in the JSON data below
2. Read the "task_list" array
3. List EXACTLY what "task_name" says for each task
4. Include the "status" from the JSON

If asked about something not in the data, say "I don't have that information in your data."
${userDataContext}`;

  try {
    // Debug: log the user data being sent to AI
    console.log('[AI Chat] User routine context:', JSON.stringify(routineContext, null, 2));
    
    const history = await AiChatMessage.find({ userId }).sort({ timestamp: 1 }).limit(15);

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 600
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
  const userId = req.user._id;
  const isAdmin = req.user.role?.name === 'admin';
  if (!isAdmin) {
    const allowed = await checkAIRoutineAllowed(userId);
    if (!allowed) {
      return res.status(403).json({ message: 'AI Routine is not included in your plan. Upgrade to Premium to use AI Routine.' });
    }
  }

  const openai = await openaiHelper.getOpenAIClient();
  if (!openai) {
    return res.status(503).json({ message: 'AI service not configured. Please set the OpenAI API key in Admin Dashboard → AI settings.' });
  }

  try {
    const systemPrompt = `
You are a helpful AI assistant for neurodivergent users.
Based on the following input, suggest a structured routine with tasks and reminders.
Reply with ONLY valid JSON, no markdown or extra text:
{
  "name": "Routine name",
  "description": "Short description",
  "tasks": [
    { "name": "Task name", "durationMinutes": 5, "order": 1 },
    { "name": "Task name", "durationMinutes": 10, "order": 2 }
  ]
}
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt || 'Suggest a simple daily routine.' }
      ]
    });

    const raw = completion.choices[0].message.content;
    const jsonStr = raw.replace(/```json?\s*/gi, '').replace(/```\s*$/gi, '').trim();
    const suggestedRoutine = JSON.parse(jsonStr);
    res.json(suggestedRoutine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating routine' });
  }
};

/** Generate routine from Q&A answers. Accepts { answers: { timeOfDay, duration, activities, goals, ... } } */
exports.generateRoutineFromQa = async (req, res) => {
  const { answers } = req.body;
  const userId = req.user._id;
  const isAdmin = req.user.role?.name === 'admin';
  if (!isAdmin) {
    const allowed = await checkAIRoutineAllowed(userId);
    if (!allowed) {
      return res.status(403).json({ message: 'AI Routine is not included in your plan. Upgrade to Premium to use AI Routine.' });
    }
  }

  const openai = await openaiHelper.getOpenAIClient();
  if (!openai) {
    return res.status(503).json({ message: 'AI service not configured. Please set the OpenAI API key in Admin Dashboard → AI settings.' });
  }

  const a = answers || {};
  
  // Parse activities - could be comma-separated string or array
  let activitiesList = [];
  if (a.activities) {
    if (Array.isArray(a.activities)) {
      activitiesList = a.activities;
    } else {
      activitiesList = a.activities.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  
  const activitiesCount = activitiesList.length;
  const activitiesStr = activitiesList.join(', ');
  
  const prompt = [
    a.timeOfDay && `Time of day: ${a.timeOfDay}`,
    a.duration && `Preferred duration: ${a.duration}`,
    activitiesStr && `Activities to include (MUST include ALL ${activitiesCount} of these as tasks): ${activitiesStr}`,
    a.goals && `Goals: ${a.goals}`,
    a.focus && `Focus areas: ${a.focus}`,
    a.extra && a.extra
  ].filter(Boolean).join('\n') || 'Suggest a gentle daily routine for someone who benefits from structure.';

  try {
    const systemPrompt = `
You are a helpful AI assistant for neurodivergent users creating routines.
Based on the following Q&A answers, suggest ONE structured routine. Reply with ONLY valid JSON, no markdown:
{
  "name": "Routine name",
  "description": "One sentence description",
  "tasks": [
    { "name": "Task name", "durationMinutes": 5, "order": 1 },
    { "name": "Task name", "durationMinutes": 10, "order": 2 }
  ]
}

IMPORTANT RULES:
- You MUST include ALL activities the user specified as individual tasks - do not skip or combine any
- Create one task for EACH activity listed by the user
- Use clear, supportive task names
- durationMinutes should be between 1 and 60
- Order tasks in a logical sequence for the time of day`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ]
    });

    const raw = completion.choices[0].message.content;
    const jsonStr = raw.replace(/```json?\s*/gi, '').replace(/```\s*$/gi, '').trim();
    const suggestedRoutine = JSON.parse(jsonStr);
    res.json(suggestedRoutine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating routine from Q&A' });
  }
};