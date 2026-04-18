const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    default: null
  },
  eventType: {
    type: String,
    required: true,
    index: true
  },
  eventData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now,
    expires: 31536000 // Automatically delete tracking entries older than 365 days
  }
});

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
