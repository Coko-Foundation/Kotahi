const Joi = require('joi')

module.exports = {
  collection: { // project
    title: Joi.string(),
    status: Joi.string()
  },
  fragment: { // version
    version: Joi.number().required(),
    submitted: Joi.boolean(),
    source: Joi.string(), // TODO: move to a file
    metadata: Joi.object({
      title: Joi.string(),
      abstract: Joi.string(),
      articleType: Joi.string(),
      articleSection: Joi.array().items(Joi.string()),
      authors: Joi.array(),
      keywords: Joi.array(),
    }),
    declarations: Joi.object().unknown(),
    suggestions: Joi.object({
      reviewers: Joi.object({
        suggested: Joi.array().items(Joi.string()),
        opposed: Joi.array().items(Joi.string())
      }),
      editors: Joi.object({
        suggested: Joi.array().items(Joi.string()),
        opposed: Joi.array().items(Joi.string())
      }),
    }),
    files: Joi.object({
      supplementary: Joi.array().items(Joi.object({
        name: Joi.string().required(),
        type: Joi.string(),
        size: Joi.number(),
        url: Joi.string()
      }))
    }),
    notes: Joi.object({
      fundingAcknowledgement: Joi.string(),
      specialInstructions: Joi.string()
    })
  },
  user: {
    name: Joi.string(), // TODO: add "name" to the login form
  }
}
