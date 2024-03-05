// This is a test mailer setup, according to instructions on:
// https://nodemailer.com/smtp/testing/

module.exports = {
  transport: {
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'patrick23@ethereal.email',
      pass: 'VbnXvJ9UW9BHevDnxk',
    },
  },
}
