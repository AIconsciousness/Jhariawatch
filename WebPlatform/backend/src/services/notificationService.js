const emailService = require('./emailService');
const firebaseService = require('./firebaseService');

class NotificationService {
  constructor() {
    this.criticalAlertsSent = new Set(); // Track alerts sent in current session
  }

  // Send critical alert for high-risk regions (updated signature for satellite processing service)
  async sendCriticalAlert(alertData) {
    try {
      const { zoneId, zoneName, subsidenceRate, riskLevel, processingDate } = alertData;

      // Create unique alert ID to prevent duplicate notifications
      const alertId = `${zoneId}-${new Date().toISOString().split('T')[0]}`;

      if (this.criticalAlertsSent.has(alertId)) {
        console.log(`⚠️ Alert already sent for ${zoneName?.en || zoneName} today`);
        return;
      }

      const alertMessage = {
        title: `🚨 Critical Subsidence Alert - ${zoneName?.en || zoneName}`,
        body: `Subsidence rate: ${subsidenceRate?.toFixed(1) || 'N/A'} mm/year. Risk Level: ${riskLevel?.toUpperCase()}`,
        data: {
          zoneId,
          zoneName: JSON.stringify(zoneName),
          subsidenceRate,
          riskLevel,
          processingDate: processingDate?.toISOString(),
          alertType: 'critical',
          timestamp: new Date().toISOString()
        }
      };

      // Send push notification via Firebase
      await firebaseService.sendNotificationToAll(alertMessage);

      // Send email alert to administrators
      await this.sendCriticalEmailAlert({
        regionId: zoneId,
        regionName: zoneName?.en || zoneName,
        subsidenceRate,
        riskScore: riskLevel === 'critical' ? 100 : riskLevel === 'high' ? 75 : 50,
        coordinates: null // Will be added if available
      });

      this.criticalAlertsSent.add(alertId);
      console.log(`✅ Critical alert sent for ${zoneName?.en || zoneName}`);

    } catch (error) {
      console.error('❌ Error sending critical alert:', error);
    }
  }

  // Send email alert for critical regions
  async sendCriticalEmailAlert(alertData) {
    try {
      const { regionId, regionName, subsidenceRate, riskScore, coordinates } = alertData;

      const subject = `🚨 CRITICAL: High Subsidence Detected in ${regionName}`;
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">Critical Subsidence Alert</h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Region: ${regionName}</h3>
            <p><strong>Subsidence Rate:</strong> ${subsidenceRate?.toFixed(1) || 'N/A'} mm/year</p>
            <p><strong>Risk Score:</strong> ${riskScore}/100</p>
            <p><strong>Coordinates:</strong> ${coordinates ? `${coordinates[0]}, ${coordinates[1]}` : 'N/A'}</p>
            <p><strong>Detection Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p style="color: #6c757d;">
            This region requires immediate attention. Please review the satellite data and consider evacuation measures if necessary.
          </p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/satellite-data"
             style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Satellite Data
          </a>
        </div>
      `;

      // Send to administrators (you can configure recipient emails)
      const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];

      if (adminEmails.length > 0) {
        for (const email of adminEmails) {
          await emailService.sendEmail(email.trim(), subject, htmlContent);
        }
        console.log(`📧 Critical email alerts sent to ${adminEmails.length} administrators`);
      }

    } catch (error) {
      console.error('❌ Error sending critical email alert:', error);
    }
  }

  // Send weekly summary email
  async sendWeeklySummary(summaryData) {
    try {
      const {
        totalProcessingRuns,
        averageProcessingTime,
        criticalRegions,
        highRiskRegions,
        averageSubsidence,
        maxSubsidence
      } = summaryData;

      const subject = '📊 Weekly JhariaWatch Satellite Processing Summary';
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007bff;">Weekly Satellite Processing Summary</h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Processing Statistics</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Processing Runs:</strong> ${totalProcessingRuns}</li>
              <li><strong>Average Processing Time:</strong> ${averageProcessingTime?.toFixed(2) || 'N/A'} seconds</li>
              <li><strong>Critical Regions:</strong> <span style="color: #dc3545;">${criticalRegions}</span></li>
              <li><strong>High Risk Regions:</strong> <span style="color: #fd7e14;">${highRiskRegions}</span></li>
              <li><strong>Average Subsidence:</strong> ${averageSubsidence?.toFixed(2) || 'N/A'} mm/year</li>
              <li><strong>Maximum Subsidence:</strong> ${maxSubsidence?.toFixed(2) || 'N/A'} mm/year</li>
            </ul>
          </div>
          <p style="color: #6c757d;">
            This is an automated weekly summary of satellite data processing for the Jharia region.
          </p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/satellite-data"
             style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Dashboard
          </a>
        </div>
      `;

      // Send to administrators
      const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];

      if (adminEmails.length > 0) {
        for (const email of adminEmails) {
          await emailService.sendEmail(email.trim(), subject, htmlContent);
        }
        console.log(`📧 Weekly summary sent to ${adminEmails.length} administrators`);
      }

    } catch (error) {
      console.error('❌ Error sending weekly summary:', error);
    }
  }

  // Send notification for new satellite data availability
  async sendDataUpdateNotification(updateInfo) {
    try {
      const notification = {
        title: '🛰️ New Satellite Data Available',
        body: `Fresh Sentinel-1 data processed for ${updateInfo.regionsProcessed || 0} regions`,
        data: {
          type: 'data_update',
          regionsProcessed: updateInfo.regionsProcessed,
          timestamp: new Date().toISOString()
        }
      };

      await firebaseService.sendNotificationToAll(notification);
      console.log('✅ Data update notification sent');

    } catch (error) {
      console.error('❌ Error sending data update notification:', error);
    }
  }

  // Send alert for system status changes
  async sendSystemAlert(message, level = 'info') {
    try {
      const colors = {
        info: '#17a2b8',
        warning: '#ffc107',
        error: '#dc3545',
        critical: '#6f42c1'
      };

      const notification = {
        title: `🔧 System Alert`,
        body: message,
        data: {
          type: 'system_alert',
          level,
          timestamp: new Date().toISOString()
        }
      };

      await firebaseService.sendNotificationToAll(notification);
      console.log(`✅ System alert sent (level: ${level})`);

    } catch (error) {
      console.error('❌ Error sending system alert:', error);
    }
  }

  // Clear sent alerts (useful for testing or daily reset)
  clearSentAlerts() {
    this.criticalAlertsSent.clear();
    console.log('🧹 Sent alerts cache cleared');
  }

  // Get notification statistics
  getStats() {
    return {
      criticalAlertsSent: this.criticalAlertsSent.size,
      uptime: process.uptime()
    };
  }
}

module.exports = new NotificationService();