require('dotenv').config();
const { sendPushNotification } = require('./src/services/firebaseService');
const { sendEmail, emailTemplates } = require('./src/services/emailService');

// Test push notification
const testPushNotification = async (fcmToken) => {
  console.log('\n📱 Testing Push Notification...\n');

  const result = await sendPushNotification(fcmToken, {
    title: '🧪 Test Notification',
    body: 'This is a test push notification from JhariaWatch backend',
    urgency: 'normal'
  }, {
    clickAction: '/dashboard/alerts',
    testData: 'true'
  });

  console.log('✅ Push notification result:', result);
  return result;
};

// Test email
const testEmail = async (email) => {
  console.log('\n📧 Testing Email Notification...\n');

  const mockUser = {
    name: 'Test User',
    email: email,
    preferredLanguage: 'en'
  };

  const mockData = {
    newReports: 5,
    activeAlerts: 2,
    riskLevel: 'moderate'
  };

  const result = await sendEmail(email, emailTemplates.weeklyUpdate(mockUser, mockData));
  console.log('✅ Email result:', result);
  return result;
};

// Main test function
const run = async () => {
  console.log('='.repeat(60));
  console.log('JhariaWatch Notification Test Script');
  console.log('='.repeat(60));

  const fcmToken = process.argv[2];
  const email = process.argv[3];

  if (!fcmToken && !email) {
    console.log('\n❌ Error: No test parameters provided\n');
    console.log('Usage:');
    console.log('  node test-notifications.js <fcm-token> [email]');
    console.log('\nExamples:');
    console.log('  # Test push notification only');
    console.log('  node test-notifications.js "your-fcm-token"');
    console.log('\n  # Test email only');
    console.log('  node test-notifications.js "" "test@example.com"');
    console.log('\n  # Test both');
    console.log('  node test-notifications.js "your-fcm-token" "test@example.com"');
    console.log('\n');
    process.exit(1);
  }

  let pushSuccess = false;
  let emailSuccess = false;

  if (fcmToken && fcmToken.length > 0) {
    try {
      const pushResult = await testPushNotification(fcmToken);
      pushSuccess = pushResult.success;
    } catch (error) {
      console.error('❌ Push notification test failed:', error);
    }
  }

  if (email && email.length > 0) {
    try {
      const emailResult = await testEmail(email);
      emailSuccess = emailResult.success;
    } catch (error) {
      console.error('❌ Email test failed:', error);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Test Summary');
  console.log('='.repeat(60));

  if (fcmToken && fcmToken.length > 0) {
    console.log(`📱 Push Notification: ${pushSuccess ? '✅ Success' : '❌ Failed'}`);
  }

  if (email && email.length > 0) {
    console.log(`📧 Email: ${emailSuccess ? '✅ Success' : '❌ Failed'}`);
  }

  console.log('='.repeat(60) + '\n');

  process.exit(pushSuccess || emailSuccess ? 0 : 1);
};

run();
