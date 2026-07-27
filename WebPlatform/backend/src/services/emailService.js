const { Resend } = require('resend');
const nodemailer = require('nodemailer');

// Constants
const OFFICIAL_FROM = process.env.EMAIL_FROM || 'jhariawatch@chakravega.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://jhariawatch.chakravega.com';

/**
 * Gets the active email provider based on environment variables.
 * Fallback priority: 1. Resend, 2. Gmail (Nodemailer), 3. Null (Logging only)
 */
const getEmailClient = () => {
  // Priority 1: Hostinger SMTP (sends from @chakravega.com natively — no domain verification needed)
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log('📧 Using Hostinger SMTP from:', process.env.EMAIL_USER);
    return {
      type: 'smtp',
      client: nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      })
    };
  }

  // Priority 2: Resend (domain must be verified on resend.com)
  if (process.env.RESEND_API_KEY) {
    return {
      type: 'resend',
      client: new Resend(process.env.RESEND_API_KEY)
    };
  }
  
  // Priority 3: Gmail SMTP (will force sender to @gmail.com)
  if (process.env.GMAIL_APP_PASSWORD) {
    return {
      type: 'gmail',
      client: nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER || 'jhariyawatch@gmail.com',
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      })
    };
  }

  return { type: 'none', client: null };
};

// =====================================================================
// SHARED LOGO IMAGE URL (hosted on your domain)
// =====================================================================
const LOGO_URL = 'https://jhariyawatch.chakravega.com/logo.png';

// =====================================================================
// ANTI-SPAM HEADERS (prevents emails from going to junk/spam)
// =====================================================================
const getAntiSpamHeaders = (messageId) => ({
  'Message-ID': messageId,
  'List-Unsubscribe': `<mailto:${OFFICIAL_FROM}?subject=unsubscribe>`,
  'Precedence': 'bulk',
  'X-Auto-Response-Suppress': 'OOF, AutoReply',
  'X-Priority': '3',
  'X-Report-Abuse': `Please report abuse to ${OFFICIAL_FROM}`,
});

// =====================================================================
// EMAIL TEMPLATES
// =====================================================================
const emailTemplates = {
  // Login notification
  loginNotification: (user, loginInfo) => {
    const lang = user.preferredLanguage || 'hi';
    const now = new Date();
    const timeStr = now.toLocaleString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
      timeZone: 'Asia/Kolkata', day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    const subject = lang === 'hi'
      ? '🔐 झरिया वॉच — लॉगिन सूचना'
      : '🔐 JhariaWatch — Login Notification';

    const html = `
      <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
        <div style="background:linear-gradient(135deg,#1a1a2e,#0f3460,#dc2626);padding:24px;text-align:center;">
          <img src="${LOGO_URL}" alt="JhariaWatch" width="56" height="56" style="border-radius:50%;background:white;padding:4px;">
          <h1 style="color:#fff;margin:8px 0 0;font-size:22px;font-weight:800;">JhariaWatch</h1>
        </div>
        <div style="padding:24px;">
          <h2 style="color:#111827;margin:0 0 4px;font-size:18px;">${lang === 'hi' ? 'नमस्ते' : 'Hello'}, ${user.name}!</h2>
          <p style="color:#6b7280;font-size:14px;margin:0 0 20px;">
            ${lang === 'hi' ? 'आपने झरिया कोलफील्ड मॉनिटरिंग सिस्टम में लॉग इन किया है।' : 'You logged into the Jharia Coalfield Monitoring System.'}
          </p>
          <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:14px;margin-bottom:16px;">
            <table style="width:100%;font-size:13px;border-collapse:collapse;">
              <tr><td style="padding:4px 0;color:#6b7280;">${lang === 'hi' ? 'ईमेल' : 'Email'}</td><td style="padding:4px 0;color:#111827;font-weight:600;">${user.email}</td></tr>
              <tr><td style="padding:4px 0;color:#6b7280;">${lang === 'hi' ? 'समय' : 'Time'}</td><td style="padding:4px 0;color:#111827;font-weight:600;">${timeStr} IST</td></tr>
              <tr><td style="padding:4px 0;color:#6b7280;">${lang === 'hi' ? 'डिवाइस' : 'Device'}</td><td style="padding:4px 0;color:#111827;font-weight:600;">${loginInfo.device || 'Web Browser'}</td></tr>
            </table>
          </div>
          <p style="color:#9ca3af;font-size:10px;text-align:center;margin:0;">
            ${lang === 'hi' ? 'अगर यह आप नहीं थे, तो तुरंत पासवर्ड बदलें।' : 'If this wasn\'t you, change your password immediately.'}
          </p>
        </div>
        <div style="background:#f9fafb;padding:14px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="color:#9ca3af;font-size:10px;margin:0;">JhariaWatch &bull; ESA Copernicus Sentinel-1 SAR</p>
        </div>
      </div>`;
    return { subject, html };
  },

  // Risk assessment report
  riskReport: (user, riskData) => {
    const lang = user.preferredLanguage || 'hi';
    const riskLevel = riskData.riskLevel || 'moderate';
    const rate = riskData.subsidenceRate || riskData.rate || 'N/A';
    const confidence = riskData.confidence || 92;
    const address = riskData.address || riskData.zoneName || 'Jharia Coalfield';

    const lc = {
      critical: { bg: '#fef2f2', text: '#dc2626', label: lang === 'hi' ? 'क्रिटिकल 🔴' : 'CRITICAL 🔴' },
      high:     { bg: '#fff7ed', text: '#ea580c', label: lang === 'hi' ? 'उच्च 🟠' : 'HIGH 🟠' },
      moderate: { bg: '#fefce8', text: '#ca8a04', label: lang === 'hi' ? 'मध्यम 🟡' : 'MODERATE 🟡' },
      low:      { bg: '#f0fdf4', text: '#16a34a', label: lang === 'hi' ? 'कम 🟢' : 'LOW 🟢' },
      stable:   { bg: '#f0fdf4', text: '#16a34a', label: lang === 'hi' ? 'स्थिर ✅' : 'STABLE ✅' },
    }[riskLevel] || { bg: '#fefce8', text: '#ca8a04', label: 'MODERATE' };

    const safetyTips = {
      critical: lang === 'hi' ? ['तुरंत सुरक्षित स्थान पर जाएं', 'स्थानीय अधिकारियों से संपर्क करें', 'इमारत की दरारों की निगरानी करें']
        : ['Evacuate to a safe zone immediately', 'Contact local authorities', 'Monitor building cracks'],
      high: lang === 'hi' ? ['सतर्क रहें और क्षेत्र की निगरानी करें', 'आपातकालीन किट तैयार रखें', 'BCCL हेल्पलाइन पर संपर्क करें']
        : ['Stay alert and monitor the area', 'Keep emergency kit ready', 'Contact BCCL helpline'],
      moderate: lang === 'hi' ? ['नियमित रूप से भवन की जांच करें', 'जल निकासी व्यवस्था बनाए रखें', 'स्थानीय समाचार अपडेट देखें']
        : ['Regularly inspect your building', 'Maintain drainage systems', 'Watch for local news updates'],
    };

    const tips = safetyTips[riskLevel] || safetyTips.moderate;
    const levelLabel = (riskLevel || 'moderate').toUpperCase();

    const subject = lang === 'hi'
      ? `📊 झरिया वॉच — जोखिम रिपोर्ट [${levelLabel}] — ${address}`
      : `📊 JhariaWatch — Risk Report [${levelLabel}] — ${address}`;

    const html = `
      <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
        <div style="background:linear-gradient(135deg,#1a1a2e,#0f3460,#dc2626);padding:24px;text-align:center;">
          <img src="${LOGO_URL}" alt="JhariaWatch" width="56" height="56" style="border-radius:50%;background:white;padding:4px;">
          <h1 style="color:#fff;margin:8px 0 0;font-size:22px;font-weight:800;">JhariaWatch</h1>
        </div>
        <div style="padding:24px;">
          <!-- Risk Level Banner -->
          <div style="background:${lc.bg};border:1px solid ${lc.text}30;border-radius:12px;padding:18px;text-align:center;margin-bottom:20px;">
            <p style="text-transform:uppercase;font-size:10px;font-weight:700;color:${lc.text};margin:0 0 4px;letter-spacing:1px;">
              ${lang === 'hi' ? 'जोखिम स्तर' : 'RISK LEVEL'}
            </p>
            <h3 style="color:${lc.text};margin:0;font-size:20px;font-weight:800;">${lc.label}</h3>
          </div>
          <p style="color:#111827;font-size:14px;margin:0 0 16px;">
            ${lang === 'hi' ? '<strong>' + address + '</strong> के लिए सैटेलाइट रिपोर्ट:' : 'Satellite report for <strong>' + address + '</strong>:'}
          </p>
          <!-- Stats -->
          <div style="display:flex;gap:12px;margin-bottom:16px;">
            <div style="flex:1;background:#f9fafb;border-radius:8px;padding:12px;text-align:center;">
              <p style="font-size:10px;color:#6b7280;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">${lang === 'hi' ? 'धंसाव दर' : 'SUBSIDENCE RATE'}</p>
              <p style="font-size:22px;font-weight:800;color:#111827;margin:0;">${rate} <span style="font-size:12px;font-weight:400;color:#6b7280;">mm/yr</span></p>
            </div>
            <div style="flex:1;background:#f9fafb;border-radius:8px;padding:12px;text-align:center;">
              <p style="font-size:10px;color:#6b7280;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">${lang === 'hi' ? 'विश्वसनीयता' : 'CONFIDENCE'}</p>
              <p style="font-size:22px;font-weight:800;color:#2563eb;margin:0;">${confidence}%</p>
            </div>
          </div>
          <!-- Details -->
          <div style="background:#f9fafb;border-radius:8px;padding:12px;margin-bottom:16px;">
            <table style="width:100%;font-size:11px;border-collapse:collapse;">
              <tr><td style="padding:3px 0;color:#6b7280;">${lang === 'hi' ? 'डेटा स्रोत' : 'Data Source'}</td><td style="padding:3px 0;color:#111827;font-weight:600;text-align:right;">Sentinel-1 SAR</td></tr>
              <tr><td style="padding:3px 0;color:#6b7280;">${lang === 'hi' ? 'विधि' : 'Method'}</td><td style="padding:3px 0;color:#111827;font-weight:600;text-align:right;">Backscatter Amplitude</td></tr>
              <tr><td style="padding:3px 0;color:#6b7280;">${lang === 'hi' ? 'अपडेट' : 'Updated'}</td><td style="padding:3px 0;color:#111827;font-weight:600;text-align:right;">${riskData.lastAcquisition || new Date().toISOString().split('T')[0]}</td></tr>
            </table>
          </div>
          <!-- Safety Tips -->
          <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px;margin-bottom:16px;">
            <p style="font-size:10px;font-weight:700;color:#1d4ed8;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">🛡️ ${lang === 'hi' ? 'सुरक्षा सिफारिशें' : 'SAFETY RECOMMENDATIONS'}</p>
            <ul style="margin:0;padding-left:18px;font-size:12px;color:#374151;line-height:1.7;">
              ${tips.map(t => `<li>${t}</li>`).join('')}
            </ul>
          </div>
          <!-- CTA -->
          <a href="${FRONTEND_URL}/dashboard/risk-check" style="display:block;background:${lc.text};color:white;padding:14px;text-align:center;text-decoration:none;border-radius:8px;font-weight:700;font-size:13px;margin-bottom:10px;">
            ${lang === 'hi' ? '📊 विस्तृत रिपोर्ट देखें' : '📊 View Detailed Report'}
          </a>
          <a href="${FRONTEND_URL}/dashboard/emergency" style="display:block;background:#111827;color:white;padding:14px;text-align:center;text-decoration:none;border-radius:8px;font-weight:700;font-size:13px;">
            🆘 ${lang === 'hi' ? 'आपातकालीन संपर्क' : 'Emergency Contacts'}
          </a>
        </div>
        <div style="background:#f9fafb;padding:14px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="color:#9ca3af;font-size:10px;margin:0;">JhariaWatch &bull; ESA Copernicus Sentinel-1 SAR &bull; Real-Time Monitoring</p>
        </div>
      </div>`;
    return { subject, html };
  },

  weeklyUpdate: (user, data) => ({
    subject: user.preferredLanguage === 'hi'
      ? '📊 झरिया वॉच - साप्ताहिक सैटेलाइट रिपोर्ट'
      : '📊 JhariaWatch - Weekly Satellite Report',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #dc2626; padding: 24px; text-align: center;">
          <img src="https://jhariyawatch.onrender.com/logo.png" alt="JhariaWatch" style="width: 60px; height: 60px; border-radius: 50%; background: white; padding: 5px;">
          <h1 style="color: white; margin: 10px 0 0 0; font-size: 24px;">JhariaWatch</h1>
        </div>
        
        <div style="padding: 24px; color: #374151;">
          <h2 style="color: #111827; margin-bottom: 8px;">
            ${user.preferredLanguage === 'hi' ? 'नमस्ते' : 'Hello'} ${user.name},
          </h2>
          <p style="font-size: 16px; line-height: 1.5;">
            ${user.preferredLanguage === 'hi'
              ? 'यहाँ आपके क्षेत्र (Sentinel-1 Satellite) के लिए इस सप्ताह का ताज़ा विश्लेषण है:'
              : 'Here is the latest satellite analysis (Sentinel-1) for your area this week:'}
          </p>
          
          <div style="background: #fef2f2; border: 1px solid #fee2e2; padding: 20px; border-radius: 12px; margin: 24px 0;">
            <p style="text-transform: uppercase; font-size: 12px; font-weight: bold; color: #dc2626; margin: 0 0 12px 0; letter-spacing: 1px;">
              ${user.preferredLanguage === 'hi' ? 'साप्ताहिक सारांश' : 'WEEKLY SUMMARY'}
            </p>
            
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
              <div style="flex: 1; min-width: 140px;">
                <p style="font-size: 12px; color: #6b7280; margin: 0;">${user.preferredLanguage === 'hi' ? 'धंसाव दर' : 'Subsidence Rate'}</p>
                <p style="font-size: 24px; font-weight: 800; color: #111827; margin: 4px 0;">${data.subsidenceRate || '0.0'} <span style="font-size: 14px; font-weight: 400;">mm/yr</span></p>
              </div>
              <div style="flex: 1; min-width: 140px;">
                <p style="font-size: 12px; color: #6b7280; margin: 0;">${user.preferredLanguage === 'hi' ? 'विश्वसनीयता' : 'Confidence'}</p>
                <p style="font-size: 24px; font-weight: 800; color: #2563eb; margin: 4px 0;">${data.confidence || '92'}%</p>
              </div>
            </div>
            
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #fee2e2;">
               <p style="font-size: 13px; color: #4b5563; margin: 0;">
                 <strong>${user.preferredLanguage === 'hi' ? 'जोखिम स्तर' : 'Risk Level'}:</strong> 
                 <span style="color: #dc2626; font-weight: bold;">${(data.riskLevel || 'Stable').toUpperCase()}</span>
               </p>
               <p style="font-size: 13px; color: #4b5563; margin: 8px 0 0 0;">
                 <strong>${user.preferredLanguage === 'hi' ? 'आखिरी अपडेट' : 'Last Updated'}:</strong> ${data.lastAcquisition || new Date().toISOString().split('T')[0]}
               </p>
            </div>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="https://jhariyawatch.onrender.com/dashboard"
               style="background-color: #dc2626; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.2);">
              ${user.preferredLanguage === 'hi' ? 'लाइव मैप देखें' : 'View Live Map'}
            </a>
          </div>

          <p style="font-size: 14px; line-height: 1.5; color: #6b7280;">
            ${user.preferredLanguage === 'hi'
              ? 'यह डाटा यूरोपीय स्पेस एजेंसी के सैटेलाइट द्वारा प्रोसेस किया गया है। यदि सुरक्षा स्तर में कोई बदलाव आता है, तो हम आपको तुरंत सूचित करेंगे।'
              : 'This data is processed directly from ESA satellite imagery. We will notify you immediately if there are any changes in safety levels.'}
          </p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            &copy; 2026 JhariaWatch Monitoring System. Stay Safe.
          </p>
        </div>
      </div>
    `,
  }),

  reportStatusUpdate: (user, report) => ({
    subject: user.preferredLanguage === 'hi'
      ? `📋 रिपोर्ट स्थिति अपडेट - ${report.reportId}`
      : `📋 Report Status Update - ${report.reportId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">
          ${user.preferredLanguage === 'hi' ? 'नमस्ते' : 'Hello'} ${user.name},
        </h2>
        <p>
          ${user.preferredLanguage === 'hi'
            ? `आपकी रिपोर्ट ${report.reportId} की स्थिति अपडेट की गई है:`
            : `Your report ${report.reportId} has been updated:`}
        </p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>${user.preferredLanguage === 'hi' ? 'नई स्थिति' : 'New Status'}:
            <span style="color: #dc2626;">${report.status.toUpperCase()}</span>
          </h3>
          ${report.review?.adminNotes ? `
            <p><strong>${user.preferredLanguage === 'hi' ? 'प्रशासक टिप्पणी' : 'Admin Notes'}:</strong></p>
            <p>${report.review.adminNotes}</p>
          ` : ''}
        </div>
        <a href="${process.env.CORS_ORIGIN || 'https://jhariyawatch.onrender.com'}/dashboard/reports/${report.reportId}"
           style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          ${user.preferredLanguage === 'hi' ? 'रिपोर्ट देखें' : 'View Report'}
        </a>
      </div>
    `,
  }),

  emergencyAlert: (user, alert) => ({
    subject: user.preferredLanguage === 'hi'
      ? `🚨 आपातकालीन अलर्ट - ${alert.title.hi}`
      : `🚨 Emergency Alert - ${alert.title.en}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">🚨 ${user.preferredLanguage === 'hi' ? 'आपातकालीन अलर्ट' : 'EMERGENCY ALERT'}</h2>
        </div>
        <div style="background: #fee2e2; padding: 20px; border-radius: 0 0 8px 8px;">
          <h3>${user.preferredLanguage === 'hi' ? alert.title.hi : alert.title.en}</h3>
          <p style="font-size: 16px;">
            ${user.preferredLanguage === 'hi' ? alert.message.hi : alert.message.en}
          </p>
          ${alert.instructions ? `
            <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <h4>${user.preferredLanguage === 'hi' ? 'निर्देश:' : 'Instructions:'}</h4>
              <ul>
                ${(user.preferredLanguage === 'hi' ? alert.instructions.hi : alert.instructions.en)
                  .map(i => `<li>${i}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          ${alert.emergencyContacts?.length ? `
            <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <h4>${user.preferredLanguage === 'hi' ? 'आपातकालीन संपर्क:' : 'Emergency Contacts:'}</h4>
              ${alert.emergencyContacts.map(c => `
                <p><strong>${c.name}</strong>: ${c.phone} (${c.role})</p>
              `).join('')}
            </div>
          ` : ''}
        </div>
        <p style="margin-top: 20px; color: #991b1b; font-weight: bold;">
          ${user.preferredLanguage === 'hi'
            ? 'कृपया तुरंत कार्रवाई करें!'
            : 'Please take immediate action!'}
        </p>
      </div>
    `,
  }),
};

const sendEmail = async (to, template) => {
  try {
    const { type, client } = getEmailClient();

    if (type === 'none') {
      console.warn('⚠️ No email service configured. Logging instead:', { to, subject: template.subject });
      return { success: true, messageId: 'logged-only' };
    }

    // Hostinger SMTP / Resend / Gmail — all use nodemailer-style send
    if (type === 'smtp' || type === 'gmail') {
      const messageId = `<JW-${Date.now()}-${Math.random().toString(36).slice(2,8)}@chakravega.com>`;
      const info = await client.sendMail({
        from: `"JhariaWatch" <${OFFICIAL_FROM}>`,
        to,
        subject: template.subject,
        html: template.html,
        headers: getAntiSpamHeaders(messageId),
      });
      console.log(`✅ Email sent via ${type}:`, info.messageId);
      return { success: true, messageId: info.messageId };
    }

    if (type === 'resend') {
      const { data, error } = await client.emails.send({
        from: `JhariaWatch <${OFFICIAL_FROM}>`,
        to: [to],
        subject: template.subject,
        html: template.html,
        headers: { 'X-Entity-Ref-ID': `<JW-${Date.now()}@chakravega.com>` },
      });

      if (error) {
        console.error('❌ Resend API Error:', error);
        return { success: false, error };
      }

      console.log('✅ Email sent via Resend:', data.id);
      return { success: true, messageId: data.id };
    }

  } catch (error) {
    console.error('❌ Email send error:', error);
    return { success: false, error: error.message };
  }
};

// Send bulk emails
const sendBulkEmails = async (recipients, templateGenerator) => {
  try {
    const results = await Promise.allSettled(
      recipients.map(recipient =>
        sendEmail(recipient.email, templateGenerator(recipient))
      )
    );

    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    console.log(`✅ Bulk emails sent: ${successCount}/${recipients.length}`);

    return {
      success: true,
      successCount,
      failureCount: recipients.length - successCount,
      results,
    };
  } catch (error) {
    console.error('❌ Bulk email error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  sendBulkEmails,
  emailTemplates,
};
