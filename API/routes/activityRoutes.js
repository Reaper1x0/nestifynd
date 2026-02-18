const express = require('express');
const router = express.Router();
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
router.post('/', ctrl.log);

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
router.get('/', ctrl.getAll);

module.exports = router;
