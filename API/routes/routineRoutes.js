
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { requirePermission, requireResourceAccess } = require('../middlewares/authorize');
const ctrl = require('../controllers/routineController');

/**
 * @swagger
 * /api/routines:
 *   get:
 *     summary: Get all routines
 *     tags: [Routines]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all routines
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Routine'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', auth, requirePermission('canCreateRoutines'), ctrl.getAll);

/**
 * @swagger
 * /api/routines/{id}:
 *   get:
 *     summary: Get routine by ID
 *     tags: [Routines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Routine ID
 *     responses:
 *       200:
 *         description: Routine details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Routine'
 *       404:
 *         description: Routine not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', auth, requireResourceAccess('routine'), ctrl.getById);

/**
 * @swagger
 * /api/routines:
 *   post:
 *     summary: Create a new routine
 *     tags: [Routines]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 description: Routine title
 *                 example: "Morning Routine"
 *               description:
 *                 type: string
 *                 description: Routine description
 *                 example: "Daily morning activities"
 *               active:
 *                 type: boolean
 *                 default: false
 *                 description: Whether the routine is active
 *               tasks:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of task IDs in this routine
 *     responses:
 *       201:
 *         description: Routine created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Routine'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', auth, requirePermission('canCreateRoutines'), ctrl.create);

/**
 * @swagger
 * /api/routines/{id}:
 *   put:
 *     summary: Update a routine
 *     tags: [Routines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Routine ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Routine'
 *     responses:
 *       200:
 *         description: Routine updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Routine'
 *       404:
 *         description: Routine not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/:id', auth, requireResourceAccess('routine'), requirePermission('canEditRoutines'), ctrl.update);

/**
 * @swagger
 * /api/routines/{id}:
 *   delete:
 *     summary: Delete a routine
 *     tags: [Routines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Routine ID
 *     responses:
 *       204:
 *         description: Routine deleted successfully
 *       404:
 *         description: Routine not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/:id', auth, requireResourceAccess('routine'), requirePermission('canDeleteRoutines'), ctrl.delete);

/**
 * @swagger
 * /api/routines/{id}/set-active:
 *   patch:
 *     summary: Set routine as active/inactive
 *     tags: [Routines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Routine ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - active
 *             properties:
 *               active:
 *                 type: boolean
 *                 description: Whether to activate or deactivate the routine
 *                 example: true
 *     responses:
 *       200:
 *         description: Routine status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Routine status updated"
 *                 routine:
 *                   $ref: '#/components/schemas/Routine'
 *       404:
 *         description: Routine not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.patch('/:id/set-active', auth, requireResourceAccess('routine'), requirePermission('canSetActiveRoutine'), ctrl.setActiveRoutine);

/**
 * @swagger
 * /api/routines/active:
 *   get:
 *     summary: Get user's active routine
 *     tags: [Routines]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active routine details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Routine'
 *       404:
 *         description: No active routine found
 *       401:
 *         description: Unauthorized
 */
router.get('/active', auth, requirePermission('canCreateRoutines'), ctrl.getActiveRoutine);

module.exports = router;
