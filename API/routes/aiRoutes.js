const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/aiController');
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middlewares/auth');

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: Chat with AI assistant
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: User message to AI
 *                 example: "Help me create a morning routine"
 *               sessionId:
 *                 type: string
 *                 description: Optional session ID for conversation continuity
 *     responses:
 *       200:
 *         description: AI response received
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                   description: AI response message
 *                 sessionId:
 *                   type: string
 *                   description: Session ID for conversation tracking
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/chat', authMiddleware, aiController.chatWithAI);

/**
 * @swagger
 * /api/ai/suggest-routine:
 *   post:
 *     summary: Get AI-suggested routine
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - preferences
 *             properties:
 *               preferences:
 *                 type: object
 *                 description: User preferences for routine generation
 *                 properties:
 *                   duration:
 *                     type: string
 *                     description: Preferred routine duration
 *                   activities:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Preferred activities
 *                   timeOfDay:
 *                     type: string
 *                     description: Preferred time of day
 *     responses:
 *       200:
 *         description: AI-suggested routine received
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 routine:
 *                   type: object
 *                   description: Suggested routine details
 *                 explanation:
 *                   type: string
 *                   description: AI explanation for the suggestion
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/suggest-routine', authMiddleware, aiController.suggestRoutine);

/**
 * @swagger
 * /api/ai:
 *   get:
 *     summary: Get all AI sessions
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of AI sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Session ID
 *                   messages:
 *                     type: array
 *                     description: Conversation messages
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: Session creation time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', ctrl.getAll);

/**
 * @swagger
 * /api/ai:
 *   post:
 *     summary: Create new AI session
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               initialMessage:
 *                 type: string
 *                 description: Initial message to start the session
 *     responses:
 *       201:
 *         description: AI session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionId:
 *                   type: string
 *                   description: New session ID
 *                 message:
 *                   type: string
 *                   example: "AI session created"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', ctrl.create);

module.exports = router;
