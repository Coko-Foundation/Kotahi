const models = require('@pubsweet/models')

const resolvers = {
  Query: {
    async cmsPages(_, vars, ctx) {
      const pages = await models.CMSPage.query()
      return pages
    },

    async cmsPage(_, { id }, ctx) {
      const cmsPage = await models.CMSPage.query().findById(id)
      return cmsPage
    },

    async cmsPageByShortcode(_, { shortcode }, ctx) {
      const cmsPage = await models.CMSPage.query().findOne({ shortcode })
      return cmsPage
    },
  },
  Mutation: {
    async updateCMSPage(_, { id, input }, ctx) {
      const attrs = input

      if (attrs?.meta) {
        attrs.meta = JSON.parse(input.meta)
      }

      if (!input.creatorId) {
        attrs.creatorId = ctx.user
      }

      const cmsPage = await models.CMSPage.query().updateAndFetchById(id, attrs)
      return cmsPage
    },
  },

  CMSPage: {
    async meta(parent) {
      if (parent.meta) {
        return JSON.stringify(parent.meta)
      }

      return null
    },
    async creator(parent) {
      return (
        parent.creator ||
        models.CMSPage.relatedQuery('creator').for(parent.id).first()
      )
    },
  },
}

const typeDefs = `
  extend type Query {
    cmsPage(id: ID!): CMSPage
    cmsPageByShortcode(shortcode: String!): CMSPage!
    cmsPages: [CMSPage!]!
  }

  extend type Mutation {
    updateCMSPage(id: ID!, input: CMSPageInput!): CMSPage
  }

  type CMSPage {
    id: ID!
    shortcode: String!
    url: String!
    title: String!
    status: String!
    content: String
    meta: String
    creator: User
    published: DateTime
    edited: DateTime
    created: DateTime!
    updated: DateTime
  }

  input CMSPageInput {
    title: String
    url: String
    content: String
    meta: String
    published: DateTime
    edited: DateTime
  }

`

module.exports = { resolvers, typeDefs }
