const cron = require('node-cron');
const mongoose = require('mongoose');
const SatelliteData = require('../models/SatelliteData');
const geeService = require('./geeService');
const { v4: uuidv4 } = require('uuid');

class SatelliteProcessingService {
  constructor() {
    this.isRunning = false;
    this.processingInterval = '0 2 */6 * *'; // Every 6 days at 2 AM
  }

  /**
   * Initialize the scheduled processing service
   */
  async initialize() {
    try {
      console.log('Initializing Satellite Processing Service...');

      // Schedule the processing job
      cron.schedule(this.processingInterval, async () => {
        if (!this.isRunning) {
          await this.runProcessingCycle();
        }
      });

      console.log(`Satellite processing scheduled for every 6 days at 2 AM`);

      // Also run immediately for testing (optional)
      // await this.runProcessingCycle();

    } catch (error) {
      console.error('Failed to initialize satellite processing service:', error);
    }
  }

  /**
   * Run a complete processing cycle
   */
  async runProcessingCycle() {
    if (this.isRunning) {
      console.log('Processing cycle already running, skipping...');
      return;
    }

    this.isRunning = true;
    const processingId = uuidv4();
    const startTime = Date.now();

    try {
      console.log(`Starting satellite processing cycle: ${processingId}`);

      // Calculate date range (last 6 days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 6);

      // Initialize GEE service
      await geeService.initialize();

      // Get Jharia region bounds
      const jhariaBounds = {
        north: 23.8,
        south: 23.6,
        east: 86.5,
        west: 86.1
      };

      // Fetch and process Sentinel-1 data
      const processedData = await this.processSentinel1Data(
        processingId,
        startDate,
        endDate,
        jhariaBounds
      );

      // Save to database
      await this.saveProcessedData(processedData);

      // Update risk zones
      await this.updateRiskZones(processedData);

      // Send notifications for critical changes
      await this.checkAndNotifyCriticalChanges(processedData);

      const processingTime = (Date.now() - startTime) / 1000;
      console.log(`Processing cycle ${processingId} completed in ${processingTime}s`);

    } catch (error) {
      console.error(`Processing cycle ${processingId} failed:`, error);

      // Save failed processing record
      await this.saveFailedProcessing(processingId, error.message);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Process Sentinel-1 data for the given date range and region
   */
  async processSentinel1Data(processingId, startDate, endDate, bounds) {
    console.log(`Processing Sentinel-1 data from ${startDate.toISOString()} to ${endDate.toISOString()}`);

    try {
      // Get available images in the date range
      const imageCollection = await geeService.getSentinel1Collection(bounds, startDate, endDate);

      if (!imageCollection || imageCollection.length === 0) {
        throw new Error('No Sentinel-1 images found in the specified date range');
      }

      // Process regional statistics
      const regionalStats = await geeService.calculateRegionalStatistics(bounds, startDate, endDate);

      // Process individual zones (Jharia risk zones)
      const zones = await this.getJhariaZones();
      const processedZones = [];

      for (const zone of zones) {
        try {
          const zoneData = await this.processZoneData(zone, startDate, endDate);
          processedZones.push(zoneData);
        } catch (zoneError) {
          console.error(`Failed to process zone ${zone.zoneId}:`, zoneError);
          // Continue with other zones
        }
      }

      // Calculate image statistics
      const imageStats = {
        totalImages: imageCollection.length,
        validImages: imageCollection.filter(img => img.properties.coherence > 0.3).length,
        averageCoherence: imageCollection.reduce((sum, img) => sum + (img.properties.coherence || 0), 0) / imageCollection.length,
        temporalBaseline: this.calculateTemporalBaseline(imageCollection),
        spatialBaseline: this.calculateSpatialBaseline(imageCollection)
      };

      return {
        processingId,
        processingDate: new Date(),
        dateRange: { start: startDate, end: endDate },
        imageStats,
        regionalData: regionalStats,
        zones: processedZones,
        status: 'completed',
        processingTime: (Date.now() - Date.parse(startDate)) / 1000,
        dataSource: {
          provider: 'ESA Copernicus',
          collection: 'COPERNICUS/S1_GRD',
          processingEngine: 'Google Earth Engine'
        }
      };

    } catch (error) {
      console.error('Error processing Sentinel-1 data:', error);
      throw error;
    }
  }

  /**
   * Process data for a specific zone
   */
  async processZoneData(zone, startDate, endDate) {
    const point = { lat: zone.coordinates.lat, lng: zone.coordinates.lng };

    // Get SAR data for the point
    const sarData = await geeService.getPointSARData(point, startDate, endDate);

    // Calculate subsidence using advanced methods
    const subsidenceData = await geeService.calculateAdvancedSubsidence(point, startDate, endDate);

    // Get historical data for trend analysis
    const historicalData = await this.getZoneHistoricalData(zone.zoneId, 5);

    // Assess risk level
    const riskAssessment = this.assessRiskLevel(subsidenceData, historicalData);

    return {
      zoneId: zone.zoneId,
      zoneName: zone.zoneName,
      coordinates: zone.coordinates,
      geometry: zone.geometry,
      sarData,
      subsidence: subsidenceData,
      riskAssessment,
      historicalData,
      quality: {
        dataCompleteness: this.calculateDataCompleteness(sarData, startDate, endDate),
        temporalCoverage: (endDate - startDate) / (1000 * 60 * 60 * 24), // days
        spatialResolution: 10 // meters for Sentinel-1
      }
    };
  }

  /**
   * Get Jharia risk zones from database
   */
  async getJhariaZones() {
    try {
      const RiskZone = require('../models/RiskZone');
      return await RiskZone.find({}).lean();
    } catch (error) {
      console.error('Error fetching Jharia zones:', error);
      // Return default zones if database fails
      return this.getDefaultJhariaZones();
    }
  }

  /**
   * Default Jharia zones as fallback
   */
  getDefaultJhariaZones() {
    return [
      {
        zoneId: 'jharia-central',
        zoneName: { en: 'Jharia Central', hi: 'झरिया केंद्रीय' },
        coordinates: { lat: 23.74, lng: 86.42 },
        geometry: { type: 'Point', coordinates: [86.42, 23.74] }
      },
      {
        zoneId: 'lodna',
        zoneName: { en: 'Lodna', hi: 'लोदना' },
        coordinates: { lat: 23.76, lng: 86.38 },
        geometry: { type: 'Point', coordinates: [86.38, 23.76] }
      },
      {
        zoneId: 'bhuli',
        zoneName: { en: 'Bhuli', hi: 'भूली' },
        coordinates: { lat: 23.72, lng: 86.35 },
        geometry: { type: 'Point', coordinates: [86.35, 23.72] }
      }
    ];
  }

  /**
   * Calculate temporal baseline of image collection
   */
  calculateTemporalBaseline(images) {
    if (images.length < 2) return 0;

    const dates = images.map(img => new Date(img.properties.date)).sort((a, b) => a - b);
    const totalSpan = dates[dates.length - 1] - dates[0];
    const avgInterval = totalSpan / (dates.length - 1);

    return avgInterval / (1000 * 60 * 60 * 24); // days
  }

  /**
   * Calculate spatial baseline (simplified)
   */
  calculateSpatialBaseline(images) {
    // This would require orbit information - simplified calculation
    return images.length > 0 ? 250 : 0; // approximate baseline in meters
  }

  /**
   * Get historical data for a zone
   */
  async getZoneHistoricalData(zoneId, limit = 5) {
    try {
      const historical = await SatelliteData.find(
        { 'zones.zoneId': zoneId, status: 'completed' },
        { 'zones.$': 1, processingDate: 1 }
      ).sort({ processingDate: -1 }).limit(limit);

      return historical.map(record => ({
        date: record.processingDate,
        rate: record.zones[0]?.subsidence?.rate || 0,
        coherence: record.zones[0]?.sarData?.coherence || 0
      }));
    } catch (error) {
      console.error('Error fetching historical data:', error);
      return [];
    }
  }

  /**
   * Assess risk level based on subsidence data and historical trends
   */
  assessRiskLevel(subsidenceData, historicalData) {
    const currentRate = subsidenceData.rate || 0;
    let score = 0;
    let level = 'stable';
    let trend = 'unknown';

    // Rate-based scoring
    if (currentRate > 100) { // >100 mm/year
      score = 90;
      level = 'critical';
    } else if (currentRate > 50) {
      score = 70;
      level = 'high';
    } else if (currentRate > 20) {
      score = 50;
      level = 'moderate';
    } else if (currentRate > 5) {
      score = 30;
      level = 'low';
    } else {
      score = 10;
      level = 'stable';
    }

    // Trend analysis
    if (historicalData.length >= 2) {
      const recentRates = historicalData.slice(0, 3).map(h => h.rate);
      const avgRecent = recentRates.reduce((a, b) => a + b, 0) / recentRates.length;
      const avgHistorical = historicalData.map(h => h.rate).reduce((a, b) => a + b, 0) / historicalData.length;

      if (avgRecent > avgHistorical * 1.2) {
        trend = 'increasing';
        score += 10;
      } else if (avgRecent < avgHistorical * 0.8) {
        trend = 'decreasing';
        score -= 10;
      } else {
        trend = 'stable';
      }
    }

    return {
      level,
      score: Math.max(0, Math.min(100, score)),
      trend,
      lastUpdated: new Date()
    };
  }

  /**
   * Calculate data completeness percentage
   */
  calculateDataCompleteness(sarData, startDate, endDate) {
    const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
    const dataPoints = sarData ? 1 : 0; // Simplified - in reality check time series length

    return Math.min(100, (dataPoints / Math.max(1, totalDays / 6)) * 100); // Expect ~1 point per 6 days
  }

  /**
   * Save processed data to database
   */
  async saveProcessedData(data) {
    try {
      const satelliteData = new SatelliteData(data);
      await satelliteData.save();
      console.log(`Saved processed data for cycle: ${data.processingId}`);
    } catch (error) {
      console.error('Error saving processed data:', error);
      throw error;
    }
  }

  /**
   * Save failed processing record
   */
  async saveFailedProcessing(processingId, errorMessage) {
    try {
      await SatelliteData.create({
        processingId,
        processingDate: new Date(),
        status: 'failed',
        errorMessage,
        dateRange: {
          start: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          end: new Date()
        }
      });
    } catch (error) {
      console.error('Error saving failed processing record:', error);
    }
  }

  /**
   * Update risk zones in database with new data
   */
  async updateRiskZones(processedData) {
    try {
      const RiskZone = require('../models/RiskZone');

      for (const zoneData of processedData.zones) {
        await RiskZone.findOneAndUpdate(
          { zoneId: zoneData.zoneId },
          {
            $set: {
              lastProcessed: processedData.processingDate,
              subsidenceRate: zoneData.subsidence.rate,
              riskLevel: zoneData.riskAssessment.level,
              riskScore: zoneData.riskAssessment.score,
              lastUpdated: new Date()
            },
            $push: {
              historicalRates: {
                date: processedData.processingDate,
                rate: zoneData.subsidence.rate,
                coherence: zoneData.sarData.coherence
              }
            }
          },
          { upsert: true }
        );
      }

      console.log(`Updated ${processedData.zones.length} risk zones`);
    } catch (error) {
      console.error('Error updating risk zones:', error);
    }
  }

  /**
   * Check for critical changes and send notifications
   */
  async checkAndNotifyCriticalChanges(processedData) {
    try {
      const criticalZones = processedData.zones.filter(
        zone => zone.riskAssessment.level === 'critical'
      );

      if (criticalZones.length > 0) {
        const notificationService = require('./notificationService');

        for (const zone of criticalZones) {
          await notificationService.sendCriticalAlert({
            zoneId: zone.zoneId,
            zoneName: zone.zoneName,
            subsidenceRate: zone.subsidence.rate,
            riskLevel: zone.riskAssessment.level,
            processingDate: processedData.processingDate
          });
        }
      }
    } catch (error) {
      console.error('Error sending critical notifications:', error);
    }
  }

  /**
   * Manual trigger for processing (for testing)
   */
  async triggerManualProcessing() {
    console.log('Manually triggering satellite processing cycle...');
    await this.runProcessingCycle();
  }

  /**
   * Get processing status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      nextScheduled: this.getNextScheduledTime(),
      lastCompleted: null // Would need to query database
    };
  }

  /**
   * Get next scheduled processing time
   */
  getNextScheduledTime() {
    // This is a simplified calculation - in production use cron library methods
    const now = new Date();
    const nextRun = new Date(now);
    nextRun.setDate(now.getDate() + (6 - (now.getDate() % 6)));
    nextRun.setHours(2, 0, 0, 0);

    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 6);
    }

    return nextRun;
  }
}

module.exports = new SatelliteProcessingService();