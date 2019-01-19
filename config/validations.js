const Joi = require('joi')

module.exports = {
  collection: {
    // project
    collectionType: Joi.string(),
    created: Joi.date(),
    title: Joi.string(),
    status: Joi.string(),
    reviewers: Joi.array(),
  },
  fragment: [
    {
      fragmentType: Joi.valid('version').required(),
      created: Joi.date(),
      collections: Joi.array(),
      version: Joi.number(),
      submitted: Joi.date(),
      source: Joi.string().allow(''), // TODO: move to a file
      metadata: Joi.object({
        title: Joi.string(),
        abstract: Joi.string().allow(''),
        articleType: Joi.string(),
        articleSection: Joi.array().items(Joi.string()),
        authors: Joi.array(),
        keywords: Joi.array(),
      }),
      declarations: Joi.object().unknown(),
      suggestions: Joi.object({
        reviewers: Joi.object({
          suggested: Joi.array().items(Joi.string().allow('')),
          opposed: Joi.array().items(Joi.string().allow('')),
        }),
        editors: Joi.object({
          suggested: Joi.array().items(Joi.string().allow('')),
          opposed: Joi.array().items(Joi.string().allow('')),
        }),
      }),
      files: Joi.object({
        manuscript: Joi.object({
          name: Joi.string().required(),
          type: Joi.string(),
          size: Joi.number(),
          url: Joi.string(),
        }),
        supplementary: Joi.array().items(
          Joi.object({
            name: Joi.string().required(),
            type: Joi.string(),
            size: Joi.number(),
            url: Joi.string(),
          }),
        ),
      }),
      notes: Joi.object({
        fundingAcknowledgement: Joi.string(),
        specialInstructions: Joi.string().allow(''),
      }),
      reviewers: Joi.array(),
      lock: Joi.object(),
      decision: Joi.object(),
    },
  ],
  user: {
    name: Joi.string(), // TODO: add "name" to the login form
    roles: Joi.object(),
  },
  team: {
    group: Joi.string(),
    status: Joi.array().items(Joi.object()),
  },
}
