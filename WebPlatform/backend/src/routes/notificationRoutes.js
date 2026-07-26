/**
 * Notification Routes
 * Handles: Sending emails & WhatsApp messages for risk reports
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const User = require('../models/User');
const { sendRiskReport, sendMultiChannelNotification, sendLoginNotification } = require('../services/notificationService');

// POST /api/notifications/risk-report
// Send risk assessment report to authenticated user
router.post('/risk-report', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { en: 'User not found', hi: 'उपयोगकर्ता नहीं मिला' }
      });
    }

    const {
      riskLevel,
      subsidenceRate,
      confidence,
      address,
      zoneName,
      zoneId,
      lastAcquisition,
      recommendations,
      coordinates
    } = req.body;

    if (!riskLevel && !subsidenceRate) {
      return res.status(400).json({
        success: false,
        error: { en: 'Risk data required', hi: 'जोखिम डेटा आवश्यक है' }
      });
    }

    const riskData = {
      riskLevel: riskLevel || 'moderate',
      subsidenceRate: subsidenceRate || 0,
      rate: subsidenceRate || 0,
      confidence: confidence || 92,
      address: address || zoneName || user.addressDetails?.area || 'Jharia Coalfield',
      zoneName: zoneName || user.addressDetails?.area || 'Jharia Coalfield',
      zoneId: zoneId || 'unknown',
      lastAcquisition: lastAcquisition || new Date().toISOString().split('T')[0],
      recommendations,
      coordinates
    };

    // Send multi-channel notification (Email + WhatsApp)
    const results = await sendMultiChannelNotification(user, riskData);

    console.log('📨 Multi-channel notification results:', JSON.stringify(results));

    res.json({
      success: true,
      message: {
        en: 'Risk report sent successfully',
        hi: 'जोखिम रिपोर्ट सफलतापूर्वक भेजी गई'
      },
      data: {
        email: results.email?.success || false,
        whatsapp: results.whatsapp?.success || false,
        channels: results
      }
    });

  } catch (error) {
    console.error('❌ Risk report notification error:', error);
    res.status(500).json({
      success: false,
      error: {
        en: 'Failed to send risk report',
        hi: 'जोखिम रिपोर्ट भेजने में विफल'
      }
    });
  }
});

// POST /api/notifications/test-email
// Test endpoint to verify email delivery
router.post('/test-email', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const testData = {
      riskLevel: 'moderate',
      subsidenceRate: 15.5,
      rate: 15.5,
      confidence: 92,
      address: user.addressDetails?.area || 'Jharia Coalfield',
      zoneName: 'Test Zone - Jharia',
      lastAcquisition: new Date().toISOString().split('T')[0],
      coordinates: user.homeLocation?.coordinates || [23.75, 86.42]
    };

    // Send email only (for testing)
    const result = await sendRiskReport(user, testData);

    res.json({
      success: result.success,
      message: result.success
        ? `Test email sent to ${user.email}`
        : `Failed: ${result.error || result.reason}`,
      data: result
    });

  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/notifications/send-to-all
// Admin endpoint to send risk updates to all users
router.post('/send-to-all', authMiddleware, async (req, res) => {
  try {
    const { riskLevel, subsidenceRate, confidence, address, message } = req.body;

    // Get all active users with email
    const users = await User.find({ isActive: true, email: { $exists: true, $ne: '' } });

    const riskData = {
      riskLevel: riskLevel || 'moderate',
      subsidenceRate: subsidenceRate || 0,
      rate: subsidenceRate || 0,
      confidence: confidence || 92,
      address: address || 'Jharia Coalfield',
      lastAcquisition: new Date().toISOString().split('T')[0]
    };

    let successCount = 0;
    for (const user of users) {
      const result = await sendMultiChannelNotification(user, riskData);
      if (result.email?.success || result.whatsapp?.success) {
        successCount++;
      }
    }

    res.json({
      success: true,
      message: {
        en: `Notifications sent to ${successCount}/${users.length} users`,
        hi: `${successCount}/${users.length} उपयोगकर्ताओं को सूचनाएं भेजी गईं`
      },
      data: { totalUsers: users.length, successCount }
    });

  } catch (error) {
    console.error('Bulk notification error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;