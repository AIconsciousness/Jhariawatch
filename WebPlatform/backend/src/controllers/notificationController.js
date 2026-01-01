const User = require('../models/User');
const Alert = require('../models/Alert');
const Report = require('../models/Report');
const { sendMulticastPushNotification, sendPushNotification } = require('../services/firebaseService');
const { sendEmail, sendBulkEmails, emailTemplates } = require('../services/emailService');

// Send emergency alert notifications (push + email)
const sendEmergencyAlertNotifications = async (alert) => {
  try {
    let targetUsers = [];

    // Find target users based on zones or all users
    if (alert.targetAll) {
      targetUsers = await User.find({
        isActive: true,
        'notifications.enabled': true,
        'notifications.emergencyAlerts': true,
      }).select('email name preferredLanguage fcmToken');
    } else if (alert.targetZones?.length > 0) {
      targetUsers = await User.find({
        isActive: true,
        'notifications.enabled': true,
        'notifications.emergencyAlerts': true,
        subscribedZones: { $in: alert.targetZones },
      }).select('email name preferredLanguage fcmToken');
    }

    if (targetUsers.length === 0) {
      console.log('No users to notify for alert:', alert.alertId);
      return { success: true, recipientCount: 0 };
    }

    // Send push notifications
    const fcmTokens = targetUsers.filter(u => u.fcmToken).map(u => u.fcmToken);
    let pushResult = { successCount: 0 };

    if (fcmTokens.length > 0) {
      const notification = {
        title: alert.severity === 'critical' ? '🚨 ' : '⚠️ ',
        body: alert.message.en.substring(0, 100),
        urgency: 'high',
      };

      pushResult = await sendMulticastPushNotification(fcmTokens, notification, {
        alertId: alert.alertId,
        severity: alert.severity,
        clickAction: '/dashboard/alerts',
      });
    }

    // Send emails
    const emailRecipients = targetUsers.filter(u => u.email).map(u => ({
      email: u.email,
      name: u.name,
      preferredLanguage: u.preferredLanguage,
    }));

    let emailResult = { successCount: 0 };
    if (emailRecipients.length > 0) {
      emailResult = await sendBulkEmails(
        emailRecipients,
        (user) => emailTemplates.emergencyAlert(user, alert)
      );
    }

    // Update alert with notification stats
    await Alert.findByIdAndUpdate(alert._id, {
      notificationSent: true,
      notificationSentAt: new Date(),
      recipientCount: targetUsers.length,
    });

    console.log(`✅ Emergency notifications sent: Push ${pushResult.successCount}, Email ${emailResult.successCount}`);

    return {
      success: true,
      recipientCount: targetUsers.length,
      pushSent: pushResult.successCount,
      emailSent: emailResult.successCount,
    };
  } catch (error) {
    console.error('❌ Emergency alert notification error:', error);
    return { success: false, error: error.message };
  }
};

// Send report status update notification (push + email)
const sendReportStatusNotification = async (reportId) => {
  try {
    const report = await Report.findOne({ reportId }).populate('userId');
    if (!report || !report.userId) {
      return { success: false, error: 'Report or user not found' };
    }

    const user = report.userId;

    // Check if user has notifications enabled
    if (!user.notifications?.enabled || !user.notifications?.reportUpdates) {
      console.log('User has report notifications disabled:', user.email);
      return { success: true, skipped: true };
    }

    // Send push notification
    if (user.fcmToken) {
      const notification = {
        title: `Report ${reportId} Updated`,
        body: `Status: ${report.status.toUpperCase()}`,
        urgency: 'normal',
      };

      await sendPushNotification(user.fcmToken, notification, {
        reportId: report.reportId,
        status: report.status,
        clickAction: `/dashboard/reports/${report.reportId}`,
      });
    }

    // Send email
    if (user.email) {
      await sendEmail(
        user.email,
        emailTemplates.reportStatusUpdate(user, report)
      );
    }

    console.log(`✅ Report status notification sent for ${reportId}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Report status notification error:', error);
    return { success: false, error: error.message };
  }
};

// Send weekly update emails (scheduled)
const sendWeeklyUpdates = async () => {
  try {
    const users = await User.find({
      isActive: true,
      'notifications.enabled': true,
      'notifications.weeklyUpdates': true,
    }).select('email name preferredLanguage subscribedZones homeLocation');

    if (users.length === 0) {
      console.log('No users for weekly updates');
      return { success: true, recipientCount: 0 };
    }

    // Fetch weekly data for each user
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const emailData = await Promise.all(
      users.map(async (user) => {
        const newReports = await Report.countDocuments({
          createdAt: { $gte: oneWeekAgo },
          'location.nearestZone': { $in: user.subscribedZones || [] },
        });

        const activeAlerts = await Alert.countDocuments({
          isActive: true,
          targetZones: { $in: user.subscribedZones || [] },
        });

        return {
          email: user.email,
          name: user.name,
          preferredLanguage: user.preferredLanguage,
          data: {
            newReports,
            activeAlerts,
            riskLevel: user.homeLocation?.currentRiskLevel || 'low',
          },
        };
      })
    );

    // Send emails
    const result = await sendBulkEmails(
      emailData,
      (user) => emailTemplates.weeklyUpdate(user, user.data)
    );

    console.log(`✅ Weekly updates sent: ${result.successCount}/${users.length}`);
    return result;
  } catch (error) {
    console.error('❌ Weekly update error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmergencyAlertNotifications,
  sendReportStatusNotification,
  sendWeeklyUpdates,
};
