const models = require('@pubsweet/models')

const { fileStorage } = require('@coko/server')

const setInitialLayout = async () => {
  const { formData } = await models.Config.query().first()
  const { primaryColor, secondaryColor } = formData.groupIdentity

  const layout = await new models.CMSLayout({
    primaryColor,
    secondaryColor,
  }).save()

  return layout
}

const resolvers = {
  Query: {
    async cmsPages(_, vars, ctx) {
      const pages = await models.CMSPage.query().orderBy('sequenceIndex')
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

    async cmsLayout(_, vars, ctx) {
      let layout = await models.CMSLayout.query().first()

      if (!layout) {
        layout = await setInitialLayout()
      }

      return layout
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

    async updateCMSLayout(_, { _id, input }, ctx) {
      const layout = await models.CMSLayout.query().first()

      if (!layout) {
        const savedCmsLayout = await new models.CMSLayout(input).save()

        const cmsLayout = await models.CMSLayout.query().findById(
          savedCmsLayout.id,
        )

        return cmsLayout
      }

      const cmsLayout = await models.CMSLayout.query().updateAndFetchById(
        layout.id,
        input,
      )

      return cmsLayout
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

  CMSLayout: {
    async logo(parent) {
      if (!parent.logoId) {
        return null
      }

      const logoFile = await models.CMSLayout.relatedQuery('logo')
        .for(parent.id)
        .first()

      const updatesStoredObjects = []
      /* eslint-disable no-await-in-loop */
      Object.keys(logoFile.storedObjects).forEach(async key => {
        const storedObject = logoFile.storedObjects[key]
        storedObject.url = await fileStorage.getURL(storedObject.key)
        updatesStoredObjects.push(storedObject)
      })

      logoFile.storedObjects = updatesStoredObjects
      return logoFile
    },
  },
}

const typeDefs = `
  extend type Query {
    cmsPage(id: ID!): CMSPage
    cmsPageByShortcode(shortcode: String!): CMSPage!
    cmsPages: [CMSPage!]!
    cmsLayout: CMSLayout
  }

  extend type Mutation {
    createCMSPage(input: CMSPageInput!): CreatePageResponse!
    updateCMSPage(id: ID!, input: CMSPageInput!): CMSPage!
    deleteCMSPage(id: ID!): DeletePageResponse!
    updateCMSLayout(input: CMSLayoutInput!): CMSLayout!
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
    menu: Boolean!
    sequenceIndex: Int!
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
    menu: Boolean
    sequenceIndex: Int
  }

  type CMSLayout {
    id: ID!
    active: Boolean!
    primaryColor: String!
    secondaryColor: String!
    logo: File
    created: DateTime!
    updated: DateTime
  }

  input CMSLayoutInput {
    primaryColor: String
    secondaryColor: String
    logoId: String
  }

`

module.exports = { resolvers, typeDefs }
