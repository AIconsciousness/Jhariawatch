const express = require('express');
const router = express.Router();
const satelliteProcessingService = require('../services/satelliteProcessingService');
const SatelliteData = require('../models/SatelliteData');

// Get processing status
router.get('/status', async (req, res) => {
  try {
    const status = satelliteProcessingService.getStatus();
    const latestProcessing = await SatelliteData.getLatestProcessing();

    res.json({
      success: true,
      data: {
        ...status,
        latestProcessing: latestProcessing ? {
          processingId: latestProcessing.processingId,
          processingDate: latestProcessing.processingDate,
          status: latestProcessing.status,
          zonesProcessed: latestProcessing.zones?.length || 0,
          criticalZones: latestProcessing.zones?.filter(z => z.riskAssessment.level === 'critical').length || 0
        } : null
      }
    });
  } catch (error) {
    console.error('Error getting processing status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get processing status'
    });
  }
});

// Manually trigger processing cycle
router.post('/trigger', async (req, res) => {
  try {
    // Check if processing is already running
    if (satelliteProcessingService.isRunning) {
      return res.status(409).json({
        success: false,
        error: 'Processing cycle already running'
      });
    }

    // Start processing in background
    satelliteProcessingService.triggerManualProcessing();

    res.json({
      success: true,
      message: 'Processing cycle started',
      data: {
        started: true,
        checkStatus: '/api/satellite/status'
      }
    });
  } catch (error) {
    console.error('Error triggering processing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger processing'
    });
  }
});

// Get latest processed data
router.get('/latest', async (req, res) => {
  try {
    const latestData = await SatelliteData.getLatestProcessing();

    if (!latestData) {
      return res.json({
        success: true,
        data: null,
        message: 'No processed data available'
      });
    }

    res.json({
      success: true,
      data: {
        processingId: latestData.processingId,
        processingDate: latestData.processingDate,
        dateRange: latestData.dateRange,
        imageStats: latestData.imageStats,
        regionalData: latestData.regionalData,
        zones: latestData.zones?.map(zone => ({
          zoneId: zone.zoneId,
          zoneName: zone.zoneName,
          coordinates: zone.coordinates,
          subsidence: zone.subsidence,
          riskAssessment: zone.riskAssessment,
          quality: zone.quality
        })),
        status: latestData.status,
        processingTime: latestData.processingTime
      }
    });
  } catch (error) {
    console.error('Error getting latest data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get latest data'
    });
  }
});

// Get historical data for a zone
router.get('/history/:zoneId', async (req, res) => {
  try {
    const { zoneId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const history = await SatelliteData.getZoneHistory(zoneId, limit);

    res.json({
      success: true,
      data: history.map(record => ({
        processingDate: record.processingDate,
        dateRange: record.dateRange,
        subsidence: record.zones[0]?.subsidence,
        riskAssessment: record.zones[0]?.riskAssessment,
        quality: record.zones[0]?.quality
      }))
    });
  } catch (error) {
    console.error('Error getting zone history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get zone history'
    });
  }
});

// Get regional statistics
router.get('/regional-stats', async (req, res) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

    const stats = await SatelliteData.getRegionalStats(startDate, endDate);

    res.json({
      success: true,
      data: stats.length > 0 ? stats[0] : null
    });
  } catch (error) {
    console.error('Error getting regional stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get regional statistics'
    });
  }
});

// Get processing history
router.get('/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status; // 'completed', 'failed', etc.

    const query = {};
    if (status) {
      query.status = status;
    }

    const history = await SatelliteData.find(query)
      .sort({ processingDate: -1 })
      .limit(limit)
      .select('processingId processingDate status processingTime dateRange imageStats regionalData zones');

    res.json({
      success: true,
      data: history.map(record => ({
        processingId: record.processingId,
        processingDate: record.processingDate,
        status: record.status,
        processingTime: record.processingTime,
        dateRange: record.dateRange,
        imageStats: record.imageStats,
        regionalData: record.regionalData,
        zonesProcessed: record.zones?.length || 0,
        criticalZones: record.zones?.filter(z => z.riskAssessment.level === 'critical').length || 0
      }))
    });
  } catch (error) {
    console.error('Error getting processing history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get processing history'
    });
  }
});

module.exports = router;