const geeService = require('../services/geeService');

const getSubsidenceData = async (req, res) => {
  try {
    const { lat, lng, bbox, startDate, endDate } = req.query;

    let result;

    if (lat && lng) {
      // Get data for specific location
      result = await geeService.getSubsidenceForLocation(parseFloat(lat), parseFloat(lng));
    } else if (bbox) {
      // Get data for bounding box
      const bboxArray = bbox.split(',').map(coord => parseFloat(coord));
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const end = endDate || new Date().toISOString().split('T')[0];

      result = await geeService.getSentinel1Data(bboxArray, start, end);
    } else {
      // Default to Jharia region
      const jhariaBbox = [86.35, 23.70, 86.45, 23.80];
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const end = endDate || new Date().toISOString().split('T')[0];

      result = await geeService.getSentinel1Data(jhariaBbox, start, end);
    }

    res.json(result);
  } catch (error) {
    console.error('GEE Controller Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch satellite data',
      message: error.message
    });
  }
};

const getRiskAssessment = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const result = await geeService.getSubsidenceForLocation(parseFloat(lat), parseFloat(lng));

    // Determine risk level and recommendations
    const riskLevel = result.location_risk?.level || 'unknown';
    const subsidenceRate = result.location_risk?.rate || 0;

    let recommendations = [];
    let alertLevel = 'low';

    if (riskLevel === 'critical') {
      alertLevel = 'high';
      recommendations = [
        'Immediate evacuation recommended',
        'Contact local authorities',
        'Avoid construction activities',
        'Monitor for cracks in buildings'
      ];
    } else if (riskLevel === 'high') {
      alertLevel = 'medium';
      recommendations = [
        'Regular monitoring required',
        'Avoid heavy construction',
        'Report any new cracks immediately',
        'Stay informed about updates'
      ];
    } else {
      recommendations = [
        'Area is relatively stable',
        'Continue normal monitoring',
        'Report any unusual changes'
      ];
    }

    res.json({
      success: true,
      data: {
        location: { lat: parseFloat(lat), lng: parseFloat(lng) },
        risk_assessment: {
          level: riskLevel,
          subsidence_rate: subsidenceRate,
          alert_level: alertLevel,
          recommendations: recommendations
        },
        satellite_data: result.data,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Risk Assessment Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to assess risk',
      message: error.message
    });
  }
};

const initializeGEE = async (req, res) => {
  try {
    await geeService.initialize();
    res.json({
      success: true,
      message: 'Google Earth Engine initialized successfully',
      initialized: geeService.initialized
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to initialize GEE',
      message: error.message
    });
  }
};

// Advanced processing endpoints

const processJhariaRegion = async (req, res) => {
  try {
    console.log('🚀 Manual Jharia region processing triggered via API');

    const result = await geeService.processJhariaRegion();

    if (result.success) {
      res.json({
        success: true,
        message: 'Jharia region processing completed successfully',
        data: result.data,
        processingTime: result.processingTime
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Processing failed',
        details: result.error
      });
    }
  } catch (error) {
    console.error('Process Jharia Region Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process Jharia region',
      message: error.message
    });
  }
};

const getHistoricalData = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const result = await geeService.getHistoricalData(parseInt(days));

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        count: result.data.length,
        dateRange: {
          from: new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000).toISOString(),
          to: new Date().toISOString()
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch historical data',
        details: result.error
      });
    }
  } catch (error) {
    console.error('Get Historical Data Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch historical data',
      message: error.message
    });
  }
};

const getRegionRiskAssessment = async (req, res) => {
  try {
    const { regionId } = req.params;

    if (!regionId) {
      return res.status(400).json({
        success: false,
        error: 'Region ID is required'
      });
    }

    const result = await geeService.getRegionRiskAssessment(regionId);

    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Region data not found',
        details: result.error
      });
    }
  } catch (error) {
    console.error('Get Region Risk Assessment Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get region risk assessment',
      message: error.message
    });
  }
};

const getProcessingStatus = async (req, res) => {
  try {
    const satelliteScheduler = require('../services/satelliteScheduler');
    const status = satelliteScheduler.getStatus();

    res.json({
      success: true,
      status: status,
      nextScheduledRun: status.nextRun?.toISOString(),
      serverUptime: process.uptime()
    });
  } catch (error) {
    console.error('Get Processing Status Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get processing status',
      message: error.message
    });
  }
};

const triggerManualProcessing = async (req, res) => {
  try {
    const satelliteScheduler = require('../services/satelliteScheduler');

    // Start processing in background
    satelliteScheduler.triggerManualProcessing();

    res.json({
      success: true,
      message: 'Manual processing triggered successfully',
      status: 'processing_started'
    });
  } catch (error) {
    console.error('Trigger Manual Processing Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger manual processing',
      message: error.message
    });
  }
};

const getJhariaRegions = async (req, res) => {
  try {
    const regions = geeService.getJhariaSubRegions();

    res.json({
      success: true,
      data: regions,
      count: regions.length
    });
  } catch (error) {
    console.error('Get Jharia Regions Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get Jharia regions',
      message: error.message
    });
  }
};

module.exports = {
  getSubsidenceData,
  getRiskAssessment,
  initializeGEE,
  processJhariaRegion,
  getHistoricalData,
  getRegionRiskAssessment,
  getProcessingStatus,
  triggerManualProcessing,
  getJhariaRegions
};