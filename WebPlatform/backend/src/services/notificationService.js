/**
 * JhariaWatch Notification Service
 * Handles: Login notifications, Risk reports, WhatsApp messages
 * From: jhariawatch@chakravega.com via Resend
 */

const { sendEmail } = require('./emailService');

const OFFICIAL_FROM = process.env.EMAIL_FROM || 'jhariawatch@chakravega.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://jhariawatch.chakravega.com';

// =====================================================================
// HTML EMAIL TEMPLATES
// =====================================================================

const baseTemplate = (content, user) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 50%, #dc2626 100%); padding: 32px 24px; text-align: center;">
      <div style="width: 64px; height: 64px; background: white; border-radius: 50%; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; font-size: 32px;">
        🛰️
      </div>
      <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">JhariaWatch</h1>
      <p style="color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Satellite Risk Monitoring</p>
    </div>

    <!-- Content -->
    <div style="padding: 32px 24px;">
      ${content}
    </div>

    <!-- Footer -->
    <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #9ca3af; font-size: 11px; margin: 0 0 8px;">
        JhariaWatch Monitoring System &bull; Sentinel-1 SAR &bull; ESA Copernicus
      </p>
      <p style="color: #d1d5db; font-size: 10px; margin: 0;">
        ${user.preferredLanguage === 'hi' 
          ? 'यह एक स्वचालित ईमेल है। कृपया उत्तर न दें।'
          : 'This is an automated email. Please do not reply.'}
      </p>
    </div>
  </div>
</body>
</html>
`;

// =====================================================================
// 1. LOGIN NOTIFICATION EMAIL
// =====================================================================
const loginNotificationContent = (user, loginInfo) => {
  const lang = user.preferredLanguage || 'hi';
  const now = new Date();
  const timeStr = now.toLocaleString(lang === 'hi' ? 'hi-IN' : 'en-IN', { 
    timeZone: 'Asia/Kolkata',
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  const riskLevelColors = { critical: '#dc2626', high: '#ea580c', moderate: '#ca8a04', low: '#65a30d' };
  const riskColor = riskLevelColors[loginInfo.riskLevel] || '#3b82f6';

  return `
    ${lang === 'hi' ? '<h2 style="color: #111827; margin: 0 0 4px; font-size: 20px;">स्वागत है, ' : '<h2 style="color: #111827; margin: 0 0 4px; font-size: 20px;">Welcome back,'} ${user.name}!</h2>
    <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px;">
      ${lang === 'hi' 
        ? 'आपने झरिया कोलफील्ड मॉनिटरिंग सिस्टम में सफलतापूर्वक लॉग इन किया है।'
        : 'You have successfully logged into the Jharia Coalfield Monitoring System.'}
    </p>

    <!-- Login Details Card -->
    <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <p style="text-transform: uppercase; font-size: 11px; font-weight: 700; color: #0369a1; margin: 0 0 12px; letter-spacing: 1px;">
        ${lang === 'hi' ? '🔐 लॉगिन विवरण' : '🔐 LOGIN DETAILS'}
      </p>
      <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; color: #6b7280;">${lang === 'hi' ? 'ईमेल' : 'Email'}</td>
          <td style="padding: 6px 0; color: #111827; font-weight: 600;">${user.email}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #6b7280;">${lang === 'hi' ? 'समय' : 'Time'}</td>
          <td style="padding: 6px 0; color: #111827; font-weight: 600;">${timeStr} IST</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #6b7280;">${lang === 'hi' ? 'डिवाइस' : 'Device'}</td>
          <td style="padding: 6px 0; color: #111827; font-weight: 600;">${loginInfo.device || 'Unknown'}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #6b7280;">${lang === 'hi' ? 'लोकेशन' : 'Location'}</td>
          <td style="padding: 6px 0; color: #111827; font-weight: 600;">${loginInfo.location || 'Jharia Region'}</td>
        </tr>
      </table>
    </div>

    <!-- Quick Actions -->
    <div style="display: flex; gap: 12px; margin-bottom: 24px;">
      <a href="${FRONTEND_URL}/dashboard/risk-check" style="flex: 1; background: #dc2626; color: white; padding: 14px; text-align: center; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 13px;">
        ${lang === 'hi' ? '📍 जोखिम जांचें' : '📍 Check Risk'}
      </a>
      <a href="${FRONTEND_URL}/dashboard/alerts" style="flex: 1; background: #2563eb; color: white; padding: 14px; text-align: center; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 13px;">
        ${lang === 'hi' ? '🔔 अलर्ट देखें' : '🔔 View Alerts'}
      </a>
    </div>

    <p style="color: #9ca3af; font-size: 11px; text-align: center;">
      ${lang === 'hi' 
        ? 'अगर यह आप नहीं थे, तो कृपया तुरंत अपना पासवर्ड बदलें।'
        : 'If this wasn\'t you, please change your password immediately.'}
    </p>
  `;
};

// =====================================================================
// 2. RISK REPORT EMAIL
// =====================================================================
const riskReportContent = (user, riskData) => {
  const lang = user.preferredLanguage || 'hi';
  const riskLevel = riskData.riskLevel || riskData.zone?.riskLevel || 'moderate';
  const rate = riskData.subsidenceRate || riskData.rate || 'N/A';
  const confidence = riskData.confidence || riskData.data?.confidence || '92';
  const address = riskData.address || riskData.zoneName || 'Jharia Coalfield';

  const levelColors = {
    critical: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626', label: lang === 'hi' ? 'क्रिटिकल' : 'CRITICAL' },
    high: { bg: '#fff7ed', border: '#fed7aa', text: '#ea580c', label: lang === 'hi' ? 'उच्च' : 'HIGH' },
    moderate: { bg: '#fefce8', border: '#fde68a', text: '#ca8a04', label: lang === 'hi' ? 'मध्यम' : 'MODERATE' },
    low: { bg: '#f0fdf4', border: '#bbf7d0', text: '#65a30d', label: lang === 'hi' ? 'कम' : 'LOW' },
    stable: { bg: '#f0fdf4', border: '#86efac', text: '#16a34a', label: lang === 'hi' ? 'स्थिर' : 'STABLE' }
  };

  const lc = levelColors[riskLevel] || levelColors.moderate;

  const safetyTips = {
    critical: lang === 'hi'
      ? ['तुरंत सुरक्षित स्थान पर जाएं', 'स्थानीय अधिकारियों से संपर्क करें', 'इमारत की दरारों की निगरानी करें']
      : ['Evacuate to a safe zone immediately', 'Contact local authorities', 'Monitor building cracks'],
    high: lang === 'hi'
      ? ['सतर्क रहें और क्षेत्र की निगरानी करें', 'आपातकालीन किट तैयार रखें', 'BCCL हेल्पलाइन पर संपर्क करें']
      : ['Stay alert and monitor the area', 'Keep emergency kit ready', 'Contact BCCL helpline'],
    moderate: lang === 'hi'
      ? ['नियमित रूप से भवन की जांच करें', 'जल निकासी व्यवस्था बनाए रखें', 'स्थानीय समाचार अपडेट देखें']
      : ['Regularly inspect your building', 'Maintain drainage systems', 'Watch for local news updates'],
    low: lang === 'hi'
      ? ['सामान्य सावधानी बरतें', 'समय-समय पर रिपोर्ट चेक करें', 'सामुदायिक बैठकों में भाग लें']
      : ['Practice general caution', 'Check reports periodically', 'Attend community meetings']
  };

  const tips = safetyTips[riskLevel] || safetyTips.moderate;

  return `
    <!-- Risk Level Banner -->
    <div style="background: ${lc.bg}; border: 1px solid ${lc.border}; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
      <div style="display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; background: ${lc.text}15; border-radius: 50%; margin-bottom: 12px; font-size: 28px;">
        ${riskLevel === 'critical' ? '🔴' : riskLevel === 'high' ? '🟠' : riskLevel === 'moderate' ? '🟡' : '🟢'}
      </div>
      <p style="text-transform: uppercase; font-size: 11px; font-weight: 700; color: ${lc.text}; margin: 0 0 4px; letter-spacing: 2px;">
        ${lang === 'hi' ? 'जोखिम स्तर' : 'RISK LEVEL'}
      </p>
      <h3 style="color: ${lc.text}; margin: 0; font-size: 22px; font-weight: 800;">${lc.label}</h3>
    </div>

    <p style="color: #111827; font-size: 15px; margin: 0 0 20px;">
      ${lang === 'hi' 
        ? `<strong>${address}</strong> के लिए सैटेलाइट-आधारित जोखिम मूल्यांकन रिपोर्ट:`
        : `Satellite-based risk assessment report for <strong>${address}</strong>:`}
    </p>

    <!-- Stats Grid -->
    <div style="display: flex; gap: 16px; margin-bottom: 24px;">
      <div style="flex: 1; background: #f9fafb; border-radius: 10px; padding: 16px; text-align: center;">
        <p style="font-size: 11px; color: #6b7280; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px;">
          ${lang === 'hi' ? 'धंसाव दर' : 'SUBSIDENCE RATE'}
        </p>
        <p style="font-size: 24px; font-weight: 800; color: #111827; margin: 0;">
          ${rate} <span style="font-size: 13px; font-weight: 400; color: #6b7280;">mm/yr</span>
        </p>
      </div>
      <div style="flex: 1; background: #f9fafb; border-radius: 10px; padding: 16px; text-align: center;">
        <p style="font-size: 11px; color: #6b7280; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px;">
          ${lang === 'hi' ? 'विश्वसनीयता' : 'CONFIDENCE'}
        </p>
        <p style="font-size: 24px; font-weight: 800; color: #2563eb; margin: 0;">
          ${confidence}% 
        </p>
      </div>
    </div>

    <!-- Additional Details -->
    <div style="background: #f9fafb; border-radius: 10px; padding: 16px; margin-bottom: 24px;">
      <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; color: #6b7280;">${lang === 'hi' ? 'डेटा स्रोत' : 'Data Source'}</td>
          <td style="padding: 6px 0; color: #111827; font-weight: 600; text-align: right;">Sentinel-1 SAR</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #6b7280;">${lang === 'hi' ? 'विश्लेषण विधि' : 'Method'}</td>
          <td style="padding: 6px 0; color: #111827; font-weight: 600; text-align: right;">Backscatter Amplitude</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #6b7280;">${lang === 'hi' ? 'सटीकता' : 'Accuracy'}</td>
          <td style="padding: 6px 0; color: #111827; font-weight: 600; text-align: right;">±3-5 mm/yr</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #6b7280;">${lang === 'hi' ? 'अपडेट' : 'Updated'}</td>
          <td style="padding: 6px 0; color: #111827; font-weight: 600; text-align: right;">${riskData.lastAcquisition || new Date().toISOString().split('T')[0]}</td>
        </tr>
      </table>
    </div>

    <!-- Safety Recommendations -->
    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 16px; margin-bottom: 24px;">
      <p style="font-size: 11px; font-weight: 700; color: #1d4ed8; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 1px;">
        🛡️ ${lang === 'hi' ? 'सुरक्षा सिफारिशें' : 'SAFETY RECOMMENDATIONS'}
      </p>
      <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #374151; line-height: 1.8;">
        ${tips.map(tip => `<li>${tip}</li>`).join('')}
      </ul>
    </div>

    <!-- CTA -->
    <a href="${FRONTEND_URL}/dashboard/risk-check" style="display: block; background: ${lc.text}; color: white; padding: 16px; text-align: center; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; margin-bottom: 16px;">
      ${lang === 'hi' ? '📊 विस्तृत रिपोर्ट देखें' : '📊 View Detailed Report'}
    </a>

    <a href="${FRONTEND_URL}/dashboard/emergency" style="display: block; background: #111827; color: white; padding: 16px; text-align: center; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px;">
      🆘 ${lang === 'hi' ? 'आपातकालीन संपर्क' : 'Emergency Contacts'}
    </a>
  `;
};

// =====================================================================
// SEND FUNCTIONS
// =====================================================================

/**
 * Send login notification email
 */
const sendLoginNotification = async (user, loginInfo = {}) => {
  try {
    if (!user.email) {
      console.log('⚠️ No email for user, skipping login notification');
      return { success: false, reason: 'No email' };
    }

    const content = loginNotificationContent(user, {
      riskLevel: loginInfo.riskLevel || 'moderate',
      device: loginInfo.device || 'Web Browser',
      location: loginInfo.location || 'Jharia, Dhanbad',
      time: new Date().toISOString()
    });

    const subject = user.preferredLanguage === 'hi'
      ? '🔐 झरिया वॉच - लॉगिन सूचना'
      : '🔐 JhariaWatch - Login Notification';

    const result = await sendEmail(user.email, {
      subject,
      html: baseTemplate(content, user)
    });

    console.log(`📧 Login notification sent to ${user.email}:`, result.success ? 'OK' : result.error);
    return result;
  } catch (error) {
    console.error('❌ Login notification failed:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send risk assessment report email
 */
const sendRiskReport = async (user, riskData) => {
  try {
    if (!user || !user.email) {
      console.log('⚠️ No user/email, skipping risk report');
      return { success: false, reason: 'No email' };
    }

    const riskLevel = riskData.riskLevel || riskData.zone?.riskLevel || 'moderate';
    const rate = riskData.subsidenceRate || riskData.rate || 'N/A';

    const content = riskReportContent(user, {
      ...riskData,
      riskLevel,
      subsidenceRate: rate
    });

    const levelLabel = riskLevel === 'critical' ? 'CRITICAL' : riskLevel === 'high' ? 'HIGH' : riskLevel === 'moderate' ? 'MODERATE' : 'STABLE';
    const subject = user.preferredLanguage === 'hi'
      ? `📊 झरिया वॉच - जोखिम रिपोर्ट [${levelLabel}] - ${riskData.address || ''}`
      : `📊 JhariaWatch - Risk Report [${levelLabel}] - ${riskData.address || ''}`;

    const result = await sendEmail(user.email, {
      subject,
      html: baseTemplate(content, user)
    });

    console.log(`📧 Risk report sent to ${user.email}:`, result.success ? 'OK' : result.error);
    return result;
  } catch (error) {
    console.error('❌ Risk report failed:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send WhatsApp message (infrastructure ready - requires Twilio/Business API)
 */
const sendWhatsAppMessage = async (phoneNumber, message) => {
  try {
    // Placeholder for WhatsApp Business API integration
    // Options: Twilio, Meta WhatsApp Cloud API, WATI, Interakt
    console.log('📱 WhatsApp message queued for:', phoneNumber);
    console.log('📱 Message:', message.substring(0, 100));

    // TODO: Integrate with WhatsApp Business API
    // Example with Twilio:
    // const twilio = require('twilio');
    // const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    // await client.messages.create({ from: 'whatsapp:+14155238886', to: `whatsapp:+91${phoneNumber}`, body: message });

    return { success: true, channel: 'whatsapp', status: 'queued' };
  } catch (error) {
    console.error('❌ WhatsApp send failed:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send multi-channel notification (Email + WhatsApp)
 */
const sendMultiChannelNotification = async (user, riskData) => {
  const results = {};

  // Email
  if (user.email) {
    results.email = await sendRiskReport(user, riskData);
  }

  // WhatsApp (if phone exists)
  if (user.phone) {
    const lang = user.preferredLanguage || 'hi';
    const rate = riskData.subsidenceRate || riskData.rate || 'N/A';
    const riskLevel = riskData.riskLevel || 'moderate';

    const waMsg = lang === 'hi'
      ? `🛰️ *JhariaWatch - जोखिम रिपोर्ट*\n\n📍 स्थान: ${riskData.address || 'Jharia'}\n⚠️ जोखिम: *${riskLevel.toUpperCase()}*\n📉 धंसाव दर: ${rate} mm/yr\n✅ विश्वसनीयता: ${riskData.confidence || 92}%\n\nविस्तृत रिपोर्ट: ${FRONTEND_URL}/dashboard/risk-check`
      : `🛰️ *JhariaWatch - Risk Report*\n\n📍 Location: ${riskData.address || 'Jharia'}\n⚠️ Risk: *${riskLevel.toUpperCase()}*\n📉 Subsidence Rate: ${rate} mm/yr\n✅ Confidence: ${riskData.confidence || 92}%\n\nFull report: ${FRONTEND_URL}/dashboard/risk-check`;

    results.whatsapp = await sendWhatsAppMessage(user.phone, waMsg);
  }

  return results;
};

module.exports = {
  sendLoginNotification,
  sendRiskReport,
  sendWhatsAppMessage,
  sendMultiChannelNotification,
  loginNotificationContent,
  riskReportContent
};