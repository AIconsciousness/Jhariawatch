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
  if (process.env.RESEND_API_KEY) {
    return {
      type: 'resend',
      client: new Resend(process.env.RESEND_API_KEY)
    };
  }
  
  if (process.env.GMAIL_APP_PASSWORD) {
    return {
      type: 'gmail',
      client: nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER || OFFICIAL_FROM,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      })
    };
  }

  return { type: 'none', client: null };
};

// Email templates ... (kept exactly as they were)
const emailTemplates = {
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
      console.warn('⚠️ No email service configured. Logging email instead:', { to, subject: template.subject });
      return { success: true, messageId: 'logged-only' };
    }

    if (type === 'resend') {
      const { data, error } = await client.emails.send({
        from: `JhariaWatch <${OFFICIAL_FROM}>`,
        to: [to],
        subject: template.subject,
        html: template.html,
      });

      if (error) {
        console.error('❌ Resend API Error:', error);
        return { success: false, error };
      }

      console.log('✅ Email sent via Resend:', data.id);
      return { success: true, messageId: data.id };
    }

    if (type === 'gmail') {
      const info = await client.sendMail({
        from: `"JhariaWatch" <${OFFICIAL_FROM}>`,
        to,
        subject: template.subject,
        html: template.html,
      });
      console.log('✅ Email sent via Gmail:', info.messageId);
      return { success: true, messageId: info.messageId };
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
