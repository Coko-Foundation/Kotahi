const path = require('path')
const Joi = require('joi')
const permissions = require('../permissions')

module.exports = {
  'pubsweet-server': {
    dbPath: path.join(__dirname, '..', 'api', 'db'),
    API_ENDPOINT: '/api'
  },
  'pubsweet-client': {
    'login-redirect': '/'
  },
  'mail-transport': {
    sendmail: true
  },
  'password-reset': {
    url: process.env.PUBSWEET_PASSWORD_RESET_URL || 'http://localhost:3000/password-reset',
    sender: process.env.PUBSWEET_PASSWORD_RESET_SENDER || 'dev@example.com'
  },
  authsome: {
    mode: permissions,
    teams: {
      // TODO
    }
  },
  pubsweet: {
    components: [
      'pubsweet-component-signup',
      'pubsweet-component-login',
      'pubsweet-component-password-reset-frontend',
      'pubsweet-component-password-reset-backend',
      'pubsweet-component-ink-frontend',
      'pubsweet-component-ink-backend',
      'pubsweet-component-wax'
    ]
  },
  'pubsweet-component-ink-backend': {
    inkEndpoint: process.env.INK_ENDPOINT || 'http://ink-api.coko.foundation',
    email: process.env.INK_USERNAME,
    password: process.env.INK_PASSWORD,
    maxRetries: 500
  },
  validations: {
    collection: { // project
      declarations: Joi.object(),
      events: Joi.object(),
      files: Joi.object(),
      metadata: Joi.object(),
      roles: Joi.object(),
      status: Joi.string().required(),
      statusDate: Joi.date().timestamp().required(),
      title: Joi.string().required()
    },
    fragment: { // snapshot
      comments: Joi.object(), // wax
      declarations: Joi.object(),
      events: Joi.object(),
      files: Joi.object(),
      lock: Joi.object().allow(null), // wax
      metadata: Joi.object(),
      progress: Joi.object(), // wax
      published: Joi.date().timestamp(),
      source: Joi.string().required(), // wax (TODO: move to file)
      status: Joi.string(),
      submitted: Joi.date().timestamp(),
      trackChanges: Joi.boolean(), // wax
      version: Joi.number().required()
    },
    user: {
      name: Joi.string(), // TODO: add "name" to the login form
      editor: Joi.boolean()
    }
  }
}
