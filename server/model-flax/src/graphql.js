const models = require('@pubsweet/models')

const resolvers = {
  Query: {
    async flaxPages(_, vars, ctx) {
      return models.FlaxPage.query()
    },

    async flaxPage(_, { id }, ctx) {
      if (id) {
        const flaxPage = await models.FlaxPage.query().findById(id)
        return flaxPage
      }
      return null
    },

    async flaxPageByShortcode(_, { shortcode }, ctx) {
      if (shortcode) {
        const flaxPage = await models.FlaxPage.query().findOne({ shortcode })
        return flaxPage
      }
      return null
    },
  },
  Mutation: {
    async updateFlaxPage(_, { id, input }, ctx) {
      return models.FlaxPage.query().updateAndFetchById(id, input)
    },
  },
}

const typeDefs = `
  extend type Query {
    flaxPage(id: ID): FlaxPage
    flaxPageByShortcode(shortcode: String!): FlaxPage
    flaxPages: [FlaxPage]
  }

  extend type Mutation {
    updateFlaxPage(id: ID, input: FlaxPageInput): FlaxPage
  }

  type FlaxPage {
    id: ID!
    title: String!
    shortcode: String!
    content: Content
    created: DateTime!
    updated: DateTime
  }

  type Content {
    title: String
    header: String
    body: String
    footer: String
  }

  input FlaxPageInput {
    title: String
    content: ContentInput
  }

  input ContentInput {
    title: String
    header: String
    body: String
    footer: String
  }

 
`

module.exports = { resolvers, typeDefs }
