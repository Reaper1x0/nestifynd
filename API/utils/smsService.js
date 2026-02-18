// utils/smsService.js
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendSmsReminder(user, itemName, itemType) {
  await client.messages.create({
    body: `Hi ${user.firstName}, this is a reminder for your "${itemName}". Don’t forget to complete it! - NestifyND`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: user.phoneNumber
  });
}

module.exports = { sendSmsReminder };