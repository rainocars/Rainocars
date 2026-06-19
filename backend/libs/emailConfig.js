const nodemailer = require('nodemailer');

const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (user && pass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });
  }

  // Graceful fallback for local development: logs emails to console if credentials are empty
  return {
    sendMail: async (options) => {
      console.log('\n---------------- MOCK EMAIL SENDER ----------------');
      console.log(`To:      ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log('------------------ HTML Preview -------------------');
      // Strip some tags to make the console output cleaner but show text contents
      const previewText = options.text || options.html.replace(/<[^>]*>/g, ' ').trim().replace(/\s+/g, ' ');
      console.log(previewText.slice(0, 300) + '...');
      console.log('---------------------------------------------------\n');
      return { messageId: 'mock-id-' + Date.now() };
    }
  };
};

const transporter = createTransporter();

module.exports = transporter;
