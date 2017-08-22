const Joi = require('joi')

module.exports = {
  collection: { // project
  },
  fragment: { // version
    version: Joi.number().required(),
    title: Joi.string(),
    abstract: Joi.string(),
    authors: Joi.string(),
  },
  user: {
    name: Joi.string(), // TODO: add "name" to the login form
  }
}
