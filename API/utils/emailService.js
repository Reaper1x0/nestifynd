
exports.sendEmail = async (to, subject, body) => {
  console.log(`Email sent to: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body:\n${body}`);
};

const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmailReminder(user, itemName, itemType) {
  const msg = {
    to: user.email,
    from: process.env.EMAIL_FROM || 'noreply@nestifynd.com',
    subject: `Your ${itemType} Reminder`,
    text: `Hi ${user.firstName},\n\nThis is a reminder for your "${itemName}". Don't forget to complete it!\n\nBest,\nNestifyND Team`
  };

  await sgMail.send(msg);
}

module.exports = { sendEmailReminder };
