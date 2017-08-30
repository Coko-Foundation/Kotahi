const Joi = require('joi')

module.exports = {
  collection: { // project
    title: Joi.string(),
  },
  fragment: { // version
    version: Joi.number().required(),
    source: Joi.string(), // TODO: move to a file
    metadata: Joi.object({
      title: Joi.string(),
      abstract: Joi.string(),
      authors: Joi.string(),
    }),
    declarations: Joi.object().unknown(),
  },
  user: {
    name: Joi.string(), // TODO: add "name" to the login form
  }
}
