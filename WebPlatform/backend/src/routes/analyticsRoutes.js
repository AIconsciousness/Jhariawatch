const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// POST /api/analytics/event - Log a telemetry event
router.post('/event', analyticsController.logEvent);

module.exports = router;
