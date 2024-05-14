const PublishedArtifact = require('../../../models/publishedArtifact/publishedArtifact.model')

const resolvers = {
  Query: {
    async publishedArtifacts(_, { manuscriptId }, ctx) {
      return PublishedArtifact.query().where({ manuscriptId })
    },
  },
}

const typeDefs = `
  extend type Query {
    publishedArtifacts(manuscriptId: ID!): [PublishedArtifact!]!
  }

  type PublishedArtifact {
    id: ID!
    created: DateTime!
    updated: DateTime
    manuscriptId: ID!
    platform: String!
    externalId: String
    title: String
    content: String
    hostedInKotahi: Boolean!
    relatedDocumentUri: String
    relatedDocumentType: String
  }
`

module.exports = { resolvers, typeDefs }
