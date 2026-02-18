
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { requireRole, requirePermission, requireUserAccess } = require('../middlewares/authorize');
const { 
  getWeeklyReport, 
  downloadWeeklyReport, 
  getAllWeeklyReports, 
  downloadAllWeeklyReports 
} = require('../controllers/reportController');

/**
 * @swagger
 * /api/reports/{userId}:
 *   get:
 *     summary: Get weekly report for a user
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Weekly report data
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.get('/:userId', auth, requireUserAccess('userId'), requirePermission('canViewReports'), getWeeklyReport);

/**
 * @swagger
 * /api/reports/{userId}/download:
 *   get:
 *     summary: Download weekly report for a user as CSV
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: CSV file download
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.get('/:userId/download', auth, requireUserAccess('userId'), requirePermission('canDownloadReports'), downloadWeeklyReport);

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Get all weekly reports (Admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All weekly reports
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied - Admin only
 */
router.get('/', auth, requireRole('admin'), requirePermission('canViewAllReports'), getAllWeeklyReports);

/**
 * @swagger
 * /api/reports/download/all:
 *   get:
 *     summary: Download all weekly reports as CSV (Admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file download with all reports
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied - Admin only
 */
router.get('/download/all', auth, requireRole('admin'), requirePermission('canDownloadReports'), downloadAllWeeklyReports);

module.exports = router;
