const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const authMiddleware = require('../middlewares/authMiddleware');
const { sendEmergencyAlertNotifications } = require('../controllers/notificationController');

router.get('/', async (req, res) => {
  try {
    const { zoneId, severity, limit = 20 } = req.query;

    const query = {
      isActive: true,
      $or: [
        { validUntil: { $gt: new Date() } },
        { validUntil: null }
      ]
    };

    if (zoneId) {
      query.$or = [
        { targetZones: zoneId },
        { targetAll: true }
      ];
    }

    if (severity) {
      query.severity = severity;
    }

    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: {
        alerts,
        totalActive: alerts.length
      }
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: { en: 'Failed to fetch alerts', hi: 'अलर्ट प्राप्त करने में विफल' } }
    });
  }
});

router.get('/:alertId', async (req, res) => {
  try {
    const alert = await Alert.findOne({ alertId: req.params.alertId }).lean();

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: { en: 'Alert not found', hi: 'अलर्ट नहीं मिला' } }
      });
    }

    res.json({ success: true, data: { alert } });
  } catch (error) {
    console.error('Get alert error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: { en: 'Failed to fetch alert', hi: 'अलर्ट प्राप्त करने में विफल' } }
    });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      alertType,
      severity,
      title,
      message,
      targetZones,
      targetAll,
      validUntil,
      instructions,
      evacuationAdvised,
      emergencyContacts
    } = req.body;

    const alertId = `ALT-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    const alert = new Alert({
      alertId,
      alertType,
      severity,
      title,
      message,
      targetZones: targetZones || [],
      targetAll: targetAll || false,
      validUntil: validUntil ? new Date(validUntil) : null,
      source: 'admin',
      createdBy: req.userId,
      instructions,
      evacuationAdvised: evacuationAdvised || false,
      emergencyContacts: emergencyContacts || [
        { name: 'BCCL Control Room', phone: '0326-2222000', role: 'Primary' },
        { name: 'Dhanbad DC Office', phone: '0326-2222001', role: 'Administration' },
        { name: 'NDMA Helpline', phone: '1078', role: 'National Disaster' }
      ]
    });

    await alert.save();

    // Send notifications asynchronously (emergency alerts only)
    if (alert.alertType === 'emergency' || alert.severity === 'critical') {
      sendEmergencyAlertNotifications(alert)
        .then(result => console.log('✅ Notifications sent:', result))
        .catch(err => console.error('❌ Notification error:', err));
    }

    res.status(201).json({
      success: true,
      message: { en: 'Alert created successfully', hi: 'अलर्ट सफलतापूर्वक बनाई गई' },
      data: { alertId: alert.alertId }
    });
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: { en: 'Failed to create alert', hi: 'अलर्ट बनाने में विफल' } }
    });
  }
});

module.exports = router;
