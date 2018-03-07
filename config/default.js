const path = require('path')
const components = require('./components.json')
const logger = require('winston')

module.exports = {
  authsome: {
    mode: path.resolve(__dirname, 'authsome.js'),
    teams: {
      // TODO
    },
  },
  validations: path.resolve(__dirname, 'validations.js'),
  pubsweet: {
    components,
  },
  'pubsweet-server': {
    db: {},
    port: 3000,
    logger,
    uploads: 'uploads',
  },
  'pubsweet-client': {
    API_ENDPOINT: '/api',
    'login-redirect': '/',
    'redux-log': false,
    theme: process.env.PUBSWEET_THEME,
  },
  mailer: {
    from: 'dev@example.com',
    transport: {
      sendmail: true,
    },
  },
  'password-reset': {
    url:
      process.env.PUBSWEET_PASSWORD_RESET_URL ||
      'http://localhost:3000/password-reset',
    sender: process.env.PUBSWEET_PASSWORD_RESET_SENDER || 'dev@example.com',
  },
  'pubsweet-component-ink-backend': {
    inkEndpoint:
      process.env.INK_ENDPOINT || 'http://inkdemo-api.coko.foundation',
    email: process.env.INK_USERNAME,
    password: process.env.INK_PASSWORD,
    maxRetries: 500,
    recipes: {
      'editoria-typescript': '2',
    },
  },
  publicKeys: ['pubsweet-client', 'authsome', 'validations'],
}
