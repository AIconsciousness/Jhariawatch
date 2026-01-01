const nodemailer = require('nodemailer');

// Create transporter for Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

// Email templates
const emailTemplates = {
  weeklyUpdate: (user, data) => ({
    subject: user.preferredLanguage === 'hi'
      ? '📊 झरिया वॉच - साप्ताहिक अपडेट'
      : '📊 JhariaWatch - Weekly Update',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">
          ${user.preferredLanguage === 'hi' ? 'नमस्ते' : 'Hello'} ${user.name},
        </h2>
        <p>
          ${user.preferredLanguage === 'hi'
            ? 'यहाँ आपके क्षेत्र के लिए इस सप्ताह का अपडेट है:'
            : 'Here is your weekly update for your area:'}
        </p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>${user.preferredLanguage === 'hi' ? 'सारांश' : 'Summary'}</h3>
          <ul>
            <li>${user.preferredLanguage === 'hi' ? 'नई रिपोर्ट' : 'New Reports'}: ${data.newReports || 0}</li>
            <li>${user.preferredLanguage === 'hi' ? 'सक्रिय अलर्ट' : 'Active Alerts'}: ${data.activeAlerts || 0}</li>
            <li>${user.preferredLanguage === 'hi' ? 'जोखिम स्तर' : 'Risk Level'}: ${data.riskLevel || 'Low'}</li>
          </ul>
        </div>
        <a href="${process.env.CORS_ORIGIN || 'https://jhariyawatch.onrender.com'}/dashboard"
           style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          ${user.preferredLanguage === 'hi' ? 'डैशबोर्ड देखें' : 'View Dashboard'}
        </a>
        <p style="margin-top: 30px; color: #6b7280; font-size: 12px;">
          ${user.preferredLanguage === 'hi'
            ? 'आप अपने खाता सेटिंग में सूचनाएं प्रबंधित कर सकते हैं।'
            : 'You can manage notifications in your account settings.'}
        </p>
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

// Send email
const sendEmail = async (to, template) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"JhariaWatch" <${process.env.GMAIL_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
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
