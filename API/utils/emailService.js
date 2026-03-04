const sgMail = require('@sendgrid/mail');
if (process.env.SENDGRID_API_KEY) sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, body) => {
  console.log(`Email sent to: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body:\n${body}`);
};

async function sendEmailReminder(user, itemName, itemType) {
  const name = user.name || user.email || 'there';
  const msg = {
    to: user.email,
    from: process.env.EMAIL_FROM || 'noreply@nestifynd.com',
    subject: `Your ${itemType} Reminder`,
    text: `Hi ${name},\n\nThis is a reminder for your "${itemName}". Don't forget to complete it!\n\nBest,\nNestifyND Team`
  };
  if (process.env.SENDGRID_API_KEY) {
    await sgMail.send(msg);
  } else {
    console.log('Reminder email (mock):', msg.subject, 'to', msg.to);
  }
}

module.exports = { sendEmail, sendEmailReminder };
