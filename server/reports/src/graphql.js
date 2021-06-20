// const logger = require('@pubsweet/logger')
const {
  generateAuthorsData,
  generateEditorsData,
  generateResearchObjectsData,
  generateReviewersData,
} = require('./mockReportingData')

// const { AuthorizationError, ConflictError } = require('@pubsweet/errors')

const resolvers = {
  Query: {
    manuscriptsActivity(_, { startDate, endDate }, ctx) {
      return generateResearchObjectsData()
    },
    handlingEditorsActivity(_, { startDate, endDate }, ctx) {
      return generateEditorsData()
    },
    managingEditorsActivity(_, { startDate, endDate }, ctx) {
      return generateEditorsData()
    },
    reviewersActivity(_, { startDate, endDate }, ctx) {
      return generateReviewersData()
    },
    authorsActivity(_, { startDate, endDate }, ctx) {
      return generateAuthorsData()
    },
  },
}

const typeDefs = `
  extend type Query {
    manuscriptsActivity(startDate: DateTime, endDate: DateTime): [ManuscriptActivity]
    handlingEditorsActivity(startDate: DateTime, endDate: DateTime): [HandlingEditorActivity]
    managingEditorsActivity(startDate: DateTime, endDate: DateTime): [HandlingEditorActivity]
    reviewersActivity(startDate: DateTime, endDate: DateTime): [ReviewerActivity]
    authorsActivity(startDate: DateTime, endDate: DateTime): [AuthorActivity]
  }

  type ManuscriptActivity {
    manuscriptNumber: String!
    entryDate: DateTime!
    title: String!
    correspondingAuthor: User!
    editors: [User!]!
    reviewers: [User!]!
    status: String!
    publishedDate: DateTime!
  }

  type HandlingEditorActivity {
    name: String!
    assignedCount: Int!
    givenToReviewersCount: Int!
    revisedCount: Int!
    rejectedCount: Int!
    acceptedCount: Int!
    publishedCount: Int!
  }

  type ManagingEditorActivity {
    name: String!
    assignedCount: Int!
    givenToReviewersCount: Int!
    revisedCount: Int!
    rejectedCount: Int!
    acceptedCount: Int!
    publishedCount: Int!
  }

  type ReviewerActivity {
    name: String!
    invitesCount: Int!
    declinedCount: Int!
    reviewsCompletedCount: Int!
    avgReviewDuration: Float!
    reccReviseCount: Int!
    reccAcceptCount: Int!
    reccRejectCount: Int!
  }


  type AuthorActivity {
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
