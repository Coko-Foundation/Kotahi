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
    async createCMSPage(_, { input }, ctx) {
      try {
        const savedCmsPage = await new models.CMSPage(input).save()
        const cmsPage = await models.CMSPage.query().findById(savedCmsPage.id)
        return { success: true, error: null, cmsPage }
      } catch (e) {
        if (e.constraint === 'cms_pages_url_key') {
          return {
            success: false,
            error: e.constraint,
            column: 'url',
            errorMessage: 'Url already taken.',
          }
        }

        return { success: false, error: 'Something went wrong.' }
      }
    },

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

    async deleteCMSPage(_, { id }, ctx) {
      try {
        const response = await models.CMSPage.query().where({ id }).delete()

        if (response) {
          return {
            success: true,
          }
        }

        return {
          success: false,
          error: `Something went wrong`,
        }
      } catch (err) {
        return {
          success: false,
          error: `Something went wrong. ${err.message}`,
        }
      }
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
      if (!parent.creatorId) {
        return null
      }

      return models.CMSPage.relatedQuery('creator').for(parent.id).first()
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
    createCMSPage(input: CMSPageInput!): CreatePageResponse!
    updateCMSPage(id: ID!, input: CMSPageInput!): CMSPage!
    deleteCMSPage(id: ID!): DeletePageResponse!
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

  type CreatePageResponse {
    cmsPage: CMSPage
    success: Boolean!
    column: String
    error: String
    errorMessage: String
  }

  type DeletePageResponse {
    success: Boolean!
    error: String
  }

  input CMSPageInput {
    title: String
    url: String
    content: String
    shortcode: String
    meta: String
    published: DateTime
    edited: DateTime
  }

`

module.exports = { resolvers, typeDefs }
