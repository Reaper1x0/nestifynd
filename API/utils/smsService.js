// utils/smsService.js
async function sendSmsReminder(user, itemName) {
  const name = user.name || user.email || 'there';
  const phone = user.phoneNumber || user.phone;
  if (!phone) {
    console.log('SMS (mock): No phone for user', user.email);
    return;
  }
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: `Hi ${name}, this is a reminder for your "${itemName}". Do not forget to complete it! - NestifyND`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
  } else {
    console.log('SMS (mock):', name, itemName);
  }
}

module.exports = { sendSmsReminder };
