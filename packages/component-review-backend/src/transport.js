const config = require('config')
const nodemailer = require('nodemailer')

// SMTP transport options: https://nodemailer.com/smtp/

const options = config.get('mailer.transport')
module.exports = nodemailer.createTransport(options)
