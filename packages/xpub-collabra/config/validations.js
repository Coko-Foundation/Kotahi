const Joi = require('joi')

module.exports = {
  collection: { // project
    title: Joi.string(),
    status: Joi.string(),
    reviewers: Joi.object(),
  },
  fragment: { // version
    // version: Joi.number().required(),
    version: Joi.number(),
    submitted: Joi.date(),
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
      manuscript: Joi.object({
        name: Joi.string().required(),
        type: Joi.string(),
        size: Joi.number(),
        url: Joi.string()
      }),
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
    }),
    lock: Joi.object(),
    fragmentType: Joi.string(), // versions, reviewers, reviews
    parentVersion: Joi.string(), // review
    projectReviewer: Joi.string(), // review
    user: Joi.string(), // review
    status: Joi.string(), // review
    events: Joi.object(), // review
  },
  user: {
    name: Joi.string(), // TODO: add "name" to the login form
    roles: Joi.object()
  },
  team: {
    group: Joi.string()
  }
}
