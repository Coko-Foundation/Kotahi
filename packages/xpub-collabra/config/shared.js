const authsome = require('./authsome')
const components = require('./components.json')
const validations = require('./validations')

module.exports = {
  authsome,
  validations,
  pubsweet: {
    components
  },
  'pubsweet-server': {
    dbPath: 'http://localhost:5984/',
    API_ENDPOINT: 'http://localhost:3000/api'
  },
  'pubsweet-client': {
    'login-redirect': '/',
    theme: process.env.PUBSWEET_THEME
  },
  'mail-transport': {
    sendmail: true
  },
  'password-reset': {
    url: process.env.PUBSWEET_PASSWORD_RESET_URL || 'http://localhost:3000/password-reset',
    sender: process.env.PUBSWEET_PASSWORD_RESET_SENDER || 'dev@example.com'
  },
  'pubsweet-component-ink-backend': {
    inkEndpoint: process.env.INK_ENDPOINT || 'http://ink-api.coko.foundation',
    email: process.env.INK_USERNAME,
    password: process.env.INK_PASSWORD,
    maxRetries: 500
  },
}
