const models = require('@pubsweet/models')

const { getFilesWithUrl } = require('../../utils/fileStorageUtils')

const resolvers = {
  Query: {
    articleTemplate: async (_, { groupId, isCms = false }) => {
      return models.ArticleTemplate.query()
        .findOne({ groupId, isCms })
        .throwIfNotFound()
    },
  },
  Mutation: {
    async updateTemplate(_, { id, input }) {
      return models.ArticleTemplate.query()
        .patchAndFetchById(id, input)
        .throwIfNotFound()
    },
  },
  ArticleTemplate: {
    async files(articleTemplate) {
      return getFilesWithUrl(
        await models.File.query().where({ objectId: articleTemplate.groupId }),
      )
    },
  },
}

const typeDefs = `
  extend type Query {
    articleTemplate(groupId: ID!, isCms: Boolean!): ArticleTemplate!
  }

  extend type Mutation {
    updateTemplate(id: ID!, input: UpdateTemplateInput!): ArticleTemplate!
  }

  type ArticleTemplate {
    id: ID!
    created: DateTime!
    updated: DateTime
    name: String
    article: String!
    css: String!
    groupId: ID!
    files: [File!]
  }

  input UpdateTemplateInput {
    article: String
    css: String
  }
`

module.exports = { typeDefs, resolvers }
