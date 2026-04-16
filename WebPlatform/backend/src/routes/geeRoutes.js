const express = require('express');
const router = express.Router();
const {
  getSubsidenceData,
  getRiskAssessment,
  initializeGEE,
  processJhariaRegion,
  getHistoricalData,
  getRegionRiskAssessment,
  getProcessingStatus,
  triggerManualProcessing,
  getJhariaRegions
} = require('../controllers/geeController');

// Initialize GEE on server start
router.get('/init', initializeGEE);

// Get subsidence data for region or location
router.get('/data', getSubsidenceData);

// Get risk assessment for specific location
router.get('/risk', getRiskAssessment);

// Advanced processing routes
// Process entire Jharia region manually
router.post('/process-region', processJhariaRegion);

// Get historical satellite data
router.get('/historical', getHistoricalData);

// Get risk assessment for specific region by ID
router.get('/region/:regionId/risk', getRegionRiskAssessment);

// Get processing scheduler status
router.get('/status', getProcessingStatus);

// Trigger manual processing
router.post('/trigger-processing', triggerManualProcessing);

// Get list of Jharia sub-regions
router.get('/regions', getJhariaRegions);

module.exports = router;