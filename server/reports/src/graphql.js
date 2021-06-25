// const logger = require('@pubsweet/logger')
const generateMovingAverages = require('./movingAverages')

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

const getDurationUntilPublished = m => {
  let start = m.submittedDate
  if (!start) start = m.created

  return m.published && start ? m.published.getTime() - start.getTime() : null
}

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

const getDateRangeSummaryStats = async (startDate, endDate, ctx) => {
  const query = ctx.models.Manuscript.query()
    .withGraphFetched('[teams, reviews]')
    .where('created', '>=', new Date(startDate))
    .where('created', '<', new Date(endDate))
    .where({ parentId: null })
    .orderBy('created')

  const manuscripts = await query

  const avgPublishTimeDays =
    mean(manuscripts.map(m => getDurationUntilPublished(m))) / dayMilliseconds

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

  manuscripts.forEach(m => {
    const wasSubm = wasSubmitted(m)
    if (wasSubm) submittedCount += 1
    else unsubmittedCount += 1
    if (wasSubm && !wasAssignedToEditor(m)) unassignedCount += 1
    if (reviewerWasInvited(m)) reviewInvitedCount += 1
    if (reviewInviteWasAccepted(m)) reviewInviteAcceptedCount += 1
    if (wasReviewed(m)) reviewedCount += 1
    if (m.status === 'rejected') rejectedCount += 1
    if (['revise', 'revising'].includes(m.status)) revisingCount += 1
    if (wasAccepted(m)) acceptedCount += 1
    if (m.published) publishedCount += 1
  })

  return {
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
}

const getLastMidnightInTimeZone = timeZoneOffset => {
  const transposedDate = new Date(Date.now() + timeZoneOffset * 60000)
  transposedDate.setUTCHours(0)
  transposedDate.setUTCMinutes(0)
  transposedDate.setUTCSeconds(0)
  transposedDate.setUTCMilliseconds(0)
  return new Date(transposedDate.getTime() - timeZoneOffset * 60000)
}

const getPublishedTodayCount = async (timeZoneOffset, ctx) => {
  const midnight = getLastMidnightInTimeZone(timeZoneOffset)

  const query = ctx.models.Manuscript.query()
    .where('published', '>=', midnight)
    .andWhere({ parentId: null })

  return query.resultSize()
}

const getRevisingNowCount = async ctx => {
  const query = ctx.models.Manuscript.query()
    .where(builder => builder.whereIn('status', ['revise', 'revising']))
    .andWhere({ parentId: null })

  return query.resultSize()
}

/** Find the first element that meets the startCondition function, and return the subarray starting at that index + startAdjustment.
 * If no element meets startCondition, return an empty array
 */
const trim = (array, startCondition) => {
  const start = array.findIndex(element => startCondition(element))
  if (start < 0) return []
  return array.slice(start)
}

const day = 24 * 60 * 60 * 1000
const week = day * 7

const getDurationsTraces = async (startDate, endDate, ctx) => {
  const windowSizeForAvg = week
  const smoothingSize = day

  const dataStart = startDate - windowSizeForAvg / 2

  const query = ctx.models.Manuscript.query()
    .withGraphFetched('[reviews]')
    .where('created', '>=', new Date(dataStart))
    .where('created', '<', new Date(endDate))
    .where({ parentId: null })

  const manuscripts = await query

  const durations = []

  manuscripts.forEach(m => {
    const submittedDate = m.submittedDate ? m.submittedDate.getTime() : null
    if (!submittedDate || submittedDate >= endDate) return // continue
    const decision = m.reviews.find(r => r.isDecision)
    const reviewedDate = decision ? decision.created : null
    let completedDate = null
    if (m.published) completedDate = m.published
    else if (m.status === 'rejected' && decision)
      completedDate = decision.updated

    durations.push({
      date: submittedDate,
      reviewDuration: reviewedDate ? (reviewedDate - submittedDate) / day : 0, // TODO fallback to null, not 0
      fullDuration: completedDate ? (completedDate - submittedDate) / day : 0, // TODO fallback to null, not 0
    })
  })

  const sortedDurations = durations.sort(d => d.date)

  const [reviewAvgs, completionAvgs] = generateMovingAverages(
    sortedDurations,
    windowSizeForAvg,
    smoothingSize,
  )

  return {
    durationsData: trim(sortedDurations, d => d.date >= startDate),
    reviewAvgsTrace: reviewAvgs,
    completionAvgsTrace: completionAvgs,
  }
}

const resolvers = {
  Query: {
    async summaryActivity(_, { startDate, endDate, timeZoneOffset }, ctx) {
      // avgPublishedDailyCount: 2.7,
      // avgRevisingDailyCount: 11.3,

      return {
        ...generateSummaryData(),
        ...(await getDateRangeSummaryStats(startDate, endDate, ctx)),
        publishedTodayCount: await getPublishedTodayCount(timeZoneOffset, ctx),
        revisingNowCount: await getRevisingNowCount(ctx),
        ...(await getDurationsTraces(startDate, endDate, ctx)),
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
    summaryActivity(startDate: DateTime, endDate: DateTime, timeZoneOffset: Int) : SummaryActivity
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
    revisingNowCount: Int!
    avgRevisingDailyCount: Float!
    durationsData: [ManuscriptDuration]
    reviewAvgsTrace: [Vector]
    completionAvgsTrace: [Vector]
  }

  type ManuscriptDuration {
    date: DateTime!
    reviewDuration: Float
    fullDuration: Float
  }

  type Vector {
    x: Float!
    y: Float!
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
