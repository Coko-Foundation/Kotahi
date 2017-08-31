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
    files: Joi.object({
      supplementary: Joi.array().items(Joi.object({
        name: Joi.string().required(),
        type: Joi.string(),
        size: Joi.number(),
        url: Joi.string()
      }))
    })
  },
  user: {
    name: Joi.string(), // TODO: add "name" to the login form
  }
}
