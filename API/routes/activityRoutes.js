const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/activityController');

/**
 * @swagger
 * /api/activities:
 *   post:
 *     summary: Log a new activity
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 description: Activity description
 *                 example: "Completed morning routine"
 *               meta:
 *                 type: object
 *                 description: Additional metadata for the activity
 *     responses:
 *       201:
 *         description: Activity logged successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Activity logged"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', auth, ctrl.log);

/**
 * @swagger
 * /api/activities:
 *   get:
 *     summary: Get all activities
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all activities
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Activity ID
 *                   action:
 *                     type: string
 *                     description: Activity description
 *                   meta:
 *                     type: object
 *                     description: Additional metadata
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: Activity timestamp
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', auth, ctrl.getMyActivities);

/**
 * @swagger
 * /api/activities/user/{userId}:
 *   get:
 *     summary: Get activities for a specific user (for caregivers/therapists)
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID to get activities for
 *     responses:
 *       200:
 *         description: List of user activities
 *       403:
 *         description: Not authorized
 */
router.get('/user/:userId', auth, ctrl.getUserActivities);

module.exports = router;
