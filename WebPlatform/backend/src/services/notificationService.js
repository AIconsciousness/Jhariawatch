/**
 * JhariaWatch Notification Service
 * Handles: Login notifications, Risk reports, WhatsApp messages
 * Uses emailTemplates from emailService.js + Hostinger SMTP (jhariawatch@chakravega.com)
 */

const { sendEmail, emailTemplates } = require('./emailService');

const OFFICIAL_FROM = process.env.EMAIL_FROM || 'jhariawatch@chakravega.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://jhariawatch.chakravega.com';

// =====================================================================
// SEND FUNCTIONS
// =====================================================================

/**
 * Send login notification email using the template from emailService.js
 */
const sendLoginNotification = async (user, loginInfo = {}) => {
  try {
    if (!user.email) {
      console.log('⚠️ No email, skipping login notification');
      return { success: false, reason: 'No email' };
    }

    const template = emailTemplates.loginNotification(user, {
      device: loginInfo.device || 'Web Browser',
      location: loginInfo.location || 'Jharia, Dhanbad'
    });

    const result = await sendEmail(user.email, template);
    console.log(`📧 Login email to ${user.email}:`, result.success ? 'OK' : result.error);
    return result;
  } catch (error) {
    console.error('❌ Login notification failed:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send risk assessment report email using the template from emailService.js
 */
const sendRiskReport = async (user, riskData) => {
  try {
    if (!user || !user.email) {
      console.log('⚠️ No email, skipping risk report');
      return { success: false, reason: 'No email' };
    }

    const template = emailTemplates.riskReport(user, {
      riskLevel: riskData.riskLevel || 'moderate',
      subsidenceRate: riskData.subsidenceRate || riskData.rate || 0,
      rate: riskData.subsidenceRate || riskData.rate || 0,
      confidence: riskData.confidence || 92,
      address: riskData.address || riskData.zoneName || 'Jharia Coalfield',
      zoneName: riskData.zoneName || riskData.address || 'Jharia Coalfield',
      lastAcquisition: riskData.lastAcquisition || new Date().toISOString().split('T')[0]
    });

    const result = await sendEmail(user.email, template);
    console.log(`📧 Risk report to ${user.email}:`, result.success ? 'OK' : result.error);
    return result;
  } catch (error) {
    console.error('❌ Risk report failed:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send WhatsApp message (infrastructure ready — Twilio / Meta API needed)
 */
const sendWhatsAppMessage = async (phoneNumber, message) => {
  try {
    console.log('📱 WhatsApp queued for:', phoneNumber);
    console.log('📱 Message:', message.substring(0, 100));
    // TODO: Integrate Twilio or Meta WhatsApp Cloud API
    return { success: true, channel: 'whatsapp', status: 'queued' };
  } catch (error) {
    console.error('❌ WhatsApp failed:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send multi-channel notification (Email + WhatsApp)
 */
const sendMultiChannelNotification = async (user, riskData) => {
  const results = {};
  if (user.email) results.email = await sendRiskReport(user, riskData);

  if (user.phone) {
    const lang = user.preferredLanguage || 'hi';
    const rate = riskData.subsidenceRate || riskData.rate || 'N/A';
    const rl = (riskData.riskLevel || 'moderate').toUpperCase();
    const waMsg = lang === 'hi'
      ? `🛰️ *JhariaWatch — जोखिम रिपोर्ट*\n\n📍 स्थान: ${riskData.address || 'Jharia'}\n⚠️ जोखिम: *${rl}*\n📉 धंसाव दर: ${rate} mm/yr\n✅ विश्वसनीयता: ${riskData.confidence || 92}%\n\nरिपोर्ट: ${FRONTEND_URL}/dashboard/risk-check`
      : `🛰️ *JhariaWatch — Risk Report*\n\n📍 Location: ${riskData.address || 'Jharia'}\n⚠️ Risk: *${rl}*\n📉 Subsidence: ${rate} mm/yr\n✅ Confidence: ${riskData.confidence || 92}%\n\nReport: ${FRONTEND_URL}/dashboard/risk-check`;
    results.whatsapp = await sendWhatsAppMessage(user.phone, waMsg);
  }

  return results;
};

module.exports = {
  sendLoginNotification,
  sendRiskReport,
  sendWhatsAppMessage,
  sendMultiChannelNotification,
};
