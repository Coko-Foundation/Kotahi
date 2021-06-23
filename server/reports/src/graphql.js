// const logger = require('@pubsweet/logger')

const {
  generateAuthorsData,
  generateEditorsData,
  generateResearchObjectsData,
  generateReviewersData,
  generateSummaryData,
} = require('./mockReportingData')

// Return mean of array, ignoring null or undefined items; return null if no valid values found
const mean = values => {
  let sum = 0
  let count = 0
  values.forEach(v => {
    if (v !== null && v !== undefined) {
      sum += v
      count += 1
    }
  })
  if (count === 0) return null
  return sum / count
}

const dayMilliseconds = 24 * 60 * 60 * 1000

// Get duration from first reviewer assigned until last review update (for first revision of manuscript only)
const getReviewingDuration = manuscript => {
  const nonDecisionReviews = manuscript.reviews.filter(r => !r.isDecision)
  if (nonDecisionReviews.length < 1) return null

  // Ignore 'decision' reviews, which are not really reviews but decisions made by the editor.
  const latestReview = nonDecisionReviews.reduce(
    (accum, curr) => Math.max(accum, curr.updated.getTime()),
    nonDecisionReviews[0].updated.getTime(),
  )

  // We can tell when the first reviewer was assigned from when the 'Reviewers' team was created.
  const reviewingStart = manuscript.teams
    .find(t => t.name === 'Reviewers')
    .created.getTime()

  return latestReview - reviewingStart
}

const getDurationUntilPublished = m =>
  m.published ? m.published.getTime() - m.submittedDate.getTime() : null

const wasSubmitted = manuscript =>
  manuscript.status && manuscript.status !== 'new'

const wasAssignedToEditor = manuscript =>
  manuscript.teams.some(t =>
    ['Senior Editor', 'Handling Editor'].includes(t.name),
  )

const reviewerWasInvited = manuscript =>
  manuscript.teams.some(t => t.name === 'Reviewers')

const reviewInviteWasAccepted = manuscript =>
  manuscript.reviews.some(r => !r.isDecision)

const wasReviewed = manuscript =>
  manuscript.reviews.some(r => !r.isDecision && r.recommendation)

const wasAccepted = manuscript =>
  ['accepted', 'published'].includes(manuscript.status)

// const isAcceptedNotPublished = manuscript =>
//   manuscript.status === 'accepted' && !manuscript.published

const resolvers = {
  Query: {
    async summaryActivity(_, { startDate, endDate }, ctx) {
      const query = ctx.models.Manuscript.query()
        .withGraphFetched(
          '[teams, reviews, manuscriptVersions(orderByCreated)]',
        )
        .where('created', '>=', new Date(startDate))
        .where('created', '<', new Date(endDate))
        .where({ parentId: null })
        .orderBy('created')

      const manuscripts = await query

      const avgPublishTimeDays =
        mean(manuscripts.map(m => getDurationUntilPublished(m))) /
        dayMilliseconds

      const avgReviewTimeDays =
        mean(manuscripts.map(m => getReviewingDuration(m))) / dayMilliseconds

      let unsubmittedCount = 0
      let submittedCount = 0
      let unassignedCount = 0
      let reviewInvitedCount = 0
      let reviewInviteAcceptedCount = 0
      let reviewedCount = 0
      let rejectedCount = 0
      let revisingCount = 0
      let acceptedCount = 0
      let publishedCount = 0
      // publishedTodayCount: 4,
      // avgPublishedDailyCount: 2.7,
      // avgRevisingDailyCount: 11.3,
      // durationsData: generateDurationsData(),

      manuscripts.forEach(m => {
        if (wasSubmitted(m)) submittedCount += 1
        else unsubmittedCount += 1
        if (!wasAssignedToEditor(m)) unassignedCount += 1
        if (reviewerWasInvited(m)) reviewInvitedCount += 1
        if (reviewInviteWasAccepted(m)) reviewInviteAcceptedCount += 1
        if (wasReviewed(m)) reviewedCount += 1
        if (m.status === 'rejected') rejectedCount += 1
        if (['revise', 'revising'].includes(m.status)) revisingCount += 1
        if (wasAccepted(m)) acceptedCount += 1
        if (m.published) publishedCount += 1
      })

      return {
        ...generateSummaryData(),
        avgReviewTimeDays,
        avgPublishTimeDays,
        unsubmittedCount,
        submittedCount,
        unassignedCount,
        reviewInvitedCount,
        reviewInviteAcceptedCount,
        reviewedCount,
        rejectedCount,
        revisingCount,
        acceptedCount,
        publishedCount,
      }
    },
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
    summaryActivity(startDate: DateTime, endDate: DateTime) : SummaryActivity
    manuscriptsActivity(startDate: DateTime, endDate: DateTime): [ManuscriptActivity]
    handlingEditorsActivity(startDate: DateTime, endDate: DateTime): [HandlingEditorActivity]
    managingEditorsActivity(startDate: DateTime, endDate: DateTime): [HandlingEditorActivity]
    reviewersActivity(startDate: DateTime, endDate: DateTime): [ReviewerActivity]
    authorsActivity(startDate: DateTime, endDate: DateTime): [AuthorActivity]
  }

  type SummaryActivity {
    avgPublishTimeDays: Float!
    avgReviewTimeDays: Float!
    unsubmittedCount: Int!
    submittedCount: Int!
    unassignedCount: Int!
    reviewInvitedCount: Int!
    reviewInviteAcceptedCount: Int!
    reviewedCount: Int!
    rejectedCount: Int!
    revisingCount: Int!
    acceptedCount: Int!
    publishedCount: Int!
    publishedTodayCount: Int!
    avgPublishedDailyCount: Float!
    avgRevisingDailyCount: Float!
    durationsData: [ManuscriptDuration]
  }

  type ManuscriptDuration {
    date: DateTime!
    reviewDuration: Float
    fullDuration: Float
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
