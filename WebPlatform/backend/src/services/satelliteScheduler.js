const cron = require('node-cron');
const geeService = require('./geeService');

class SatelliteProcessingScheduler {
  constructor() {
    this.isRunning = false;
    this.lastRun = null;
    this.nextRun = null;
  }

  // Initialize the scheduler
  async initialize() {
    console.log('🕒 Initializing Satellite Processing Scheduler...');

    // Schedule processing every 6 days (Sentinel-1 revisit cycle)
    // Cron expression: '0 2 */6 * *' = Every 6 days at 2 AM
    cron.schedule('0 2 */6 * *', async () => {
      console.log('🚀 Scheduled satellite processing started...');
      await this.processJhariaRegion();
    }, {
      timezone: 'Asia/Kolkata'
    });

    // Also schedule a weekly summary on Mondays at 9 AM
    cron.schedule('0 9 * * 1', async () => {
      console.log('📊 Weekly satellite data summary...');
      await this.generateWeeklySummary();
    }, {
      timezone: 'Asia/Kolkata'
    });

    // Calculate next run time
    this.calculateNextRun();

    console.log('✅ Satellite Processing Scheduler initialized');
    console.log(`📅 Next processing run: ${this.nextRun?.toLocaleString()}`);
  }

  // Main processing function
  async processJhariaRegion() {
    if (this.isRunning) {
      console.log('⚠️ Processing already running, skipping...');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      console.log('🛰️ Starting Jharia region satellite processing...');

      const result = await geeService.processJhariaRegion();

      if (result.success) {
        this.lastRun = new Date();
        console.log(`✅ Processing completed successfully in ${result.processingTime?.toFixed(2) || 'N/A'} seconds`);
        console.log(`📊 Processed ${result.regionsProcessed || 0} regions`);

        // Trigger notifications for critical changes
        await this.checkForCriticalChanges(result.data);
      } else {
        console.error('❌ Processing failed:', result.error);
      }

    } catch (error) {
      console.error('💥 Processing error:', error);
    } finally {
      this.isRunning = false;
      this.calculateNextRun();
    }
  }

  // Manual trigger for testing
  async triggerManualProcessing() {
    console.log('🔧 Manual processing triggered...');
    await this.processJhariaRegion();
  }

  // Check for critical changes and send notifications
  async checkForCriticalChanges(satelliteData) {
    try {
      const criticalRegions = satelliteData.regions.filter(r => r.riskLevel === 'critical');

      if (criticalRegions.length > 0) {
        console.log(`🚨 Found ${criticalRegions.length} critical regions`);

        // Import notification service
        const notificationService = require('./notificationService');

        // Send alerts for critical regions
        for (const region of criticalRegions) {
          await notificationService.sendCriticalAlert({
            regionId: region.regionId,
            regionName: region.regionName,
            subsidenceRate: region.subsidenceRate,
            riskScore: region.riskScore,
            coordinates: region.coordinates
          });
        }
      }
    } catch (error) {
      console.error('❌ Error checking critical changes:', error);
    }
  }

  // Generate weekly summary
  async generateWeeklySummary() {
    try {
      const SatelliteData = require('../models/SatelliteData');

      // Get last 7 days of data
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentData = await SatelliteData.find({
        acquisitionDate: { $gte: sevenDaysAgo },
        processingStatus: 'completed'
      }).sort({ acquisitionDate: -1 });

      if (recentData.length === 0) {
        console.log('📊 No recent satellite data for weekly summary');
        return;
      }

      // Calculate summary statistics
      const summary = {
        totalProcessingRuns: recentData.length,
        averageProcessingTime: recentData.reduce((acc, d) => acc + (d.processingTime || 0), 0) / recentData.length,
        criticalRegions: recentData[recentData.length - 1]?.statistics?.criticalRegions || 0,
        highRiskRegions: recentData[recentData.length - 1]?.statistics?.highRiskRegions || 0,
        averageSubsidence: recentData[recentData.length - 1]?.statistics?.averageSubsidence || 0,
        maxSubsidence: recentData[recentData.length - 1]?.statistics?.maxSubsidence || 0
      };

      console.log('📊 Weekly Satellite Summary:');
      console.log(`   - Processing runs: ${summary.totalProcessingRuns}`);
      console.log(`   - Critical regions: ${summary.criticalRegions}`);
      console.log(`   - High risk regions: ${summary.highRiskRegions}`);
      console.log(`   - Average subsidence: ${summary.averageSubsidence.toFixed(2)} mm/year`);
      console.log(`   - Max subsidence: ${summary.maxSubsidence.toFixed(2)} mm/year`);

      // Send weekly summary email
      const notificationService = require('./notificationService');
      await notificationService.sendWeeklySummary(summary);

    } catch (error) {
      console.error('❌ Error generating weekly summary:', error);
    }
  }

  // Get scheduler status
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      nextRun: this.nextRun,
      status: this.isRunning ? 'processing' : 'idle'
    };
  }

  // Calculate next run time
  calculateNextRun() {
    const now = new Date();
    const nextRun = new Date(now);

    // Calculate days until next 6-day interval
    const daysSinceEpoch = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
    const nextInterval = Math.ceil((daysSinceEpoch + 1) / 6) * 6;
    const daysUntilNext = nextInterval - daysSinceEpoch;

    nextRun.setDate(now.getDate() + daysUntilNext);
    nextRun.setHours(2, 0, 0, 0); // 2 AM

    this.nextRun = nextRun;
  }

  // Force immediate processing (for testing)
  async forceProcessNow() {
    console.log('⚡ Force processing triggered...');
    await this.processJhariaRegion();
  }
}

module.exports = new SatelliteProcessingScheduler();