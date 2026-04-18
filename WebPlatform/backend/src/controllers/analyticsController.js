const AnalyticsEvent = require('../models/AnalyticsEvent');

exports.logEvent = async (req, res) => {
  try {
    const { sessionId, userId, eventType, eventData } = req.body;
    
    // We only strictly require eventType and sessionId
    if (!sessionId || !eventType) {
      return res.status(400).json({ 
        success: false, 
        message: 'sessionId and eventType are required' 
      });
    }

    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const newEvent = new AnalyticsEvent({
      sessionId,
      userId,
      eventType,
      eventData,
      ipAddress,
      userAgent
    });

    await newEvent.save();

    res.status(201).json({ success: true, message: 'Analytics recorded' });
  } catch (error) {
    console.error('Analytics event processing error:', error);
    res.status(500).json({ success: false, message: 'Server processing error' });
  }
};
