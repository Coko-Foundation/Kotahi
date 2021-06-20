// const logger = require('@pubsweet/logger')
const { generateAuthorsData } = require('./mockReportingData')

// const { AuthorizationError, ConflictError } = require('@pubsweet/errors')

const resolvers = {
  Query: {
    activeAuthors(_, { id, username }, ctx) {
      return generateAuthorsData()
    },
  },
}

const typeDefs = `
  extend type Query {
    activeAuthors(startDate: DateTime, endDate: DateTime): [ActiveAuthor]
  }

  type ActiveAuthor {
    name: String!
    unsubmittedCount: Int!
    submittedCount: Int!
    rejectedCount: Int!
    revisionCount: Int!
    acceptedCount: Int!
    publishedCount: Int!
  }
`

module.exports = { resolvers, typeDefs }
