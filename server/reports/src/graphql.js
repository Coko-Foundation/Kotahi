// const logger = require('@pubsweet/logger')
const generateMovingAverages = require('./movingAverages')

const {
  generateAuthorsData,
  generateEditorsData,
} = require('./mockReportingData')

const capitalize = text => {
  if (text.length <= 0) return ''
  return text.charAt(0).toUpperCase() + text.slice(1)
}

const getIsoDateString = date => (date ? date.toISOString().slice(0, 10) : null)

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

const getCompletedDate = manuscript => {
  if (manuscript.published) return manuscript.published
  const decision = manuscript.reviews.find(r => r.isDecision)
  if (manuscript.status === 'rejected' && decision) return decision.updated
  return null
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
    .orderBy('created')

  const manuscripts = await query

  const durations = []

  manuscripts.forEach(m => {
    const submittedDate = m.submittedDate ? m.submittedDate.getTime() : null
    if (!submittedDate || submittedDate >= endDate) return // continue
    const decision = m.reviews.find(r => r.isDecision)
    const reviewedDate = decision ? decision.created : null
    const completedDate = getCompletedDate(m)

    const reviewDuration = reviewedDate
      ? (reviewedDate - submittedDate) / day
      : 0 // TODO fallback to null, not 0

    const fullDuration = completedDate
      ? (completedDate - submittedDate) / day
      : reviewDuration // TODO fallback to null, not reviewDuration

    durations.push({
      date: submittedDate,
      reviewDuration,
      fullDuration,
    })
  })

  const sortedDurations = durations.sort((d0, d1) => d0.date - d1.date)

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

const getDailyAverageStats = async (startDate, endDate, ctx) => {
  const dataStart = startDate - 365 * day // TODO: any better way to ensure we get all manuscripts still in progress during this date range?

  const query = ctx.models.Manuscript.query()
    .withGraphFetched('[reviews]')
    .where('created', '>=', new Date(dataStart))
    .where('created', '<', new Date(endDate))
    .where({ parentId: null })
    .orderBy('created')

  const manuscripts = await query

  const orderedSubmissionDates = manuscripts.map(m => m.submittedDate).sort()

  const orderedCompletionDates = manuscripts
    .map(m => getCompletedDate(m))
    .sort()

  const publishedTotal = manuscripts.filter(
    m => m.published && m.published >= startDate,
  ).length

  let submI = 0
  let compI = 0
  let inProgressCount = 0

  let dailyInProgressTotal = 0

  for (let d = startDate + day; d < endDate; d += day) {
    while (
      submI < orderedSubmissionDates.length &&
      orderedSubmissionDates[submI] <= d
    ) {
      inProgressCount += 1
      submI += 1
    }

    while (
      compI < orderedCompletionDates.length &&
      orderedCompletionDates[compI] <= d
    ) {
      inProgressCount -= 1
      compI += 1
    }

    dailyInProgressTotal += inProgressCount
  }

  const durationDays = (endDate - startDate) / day
  return {
    avgPublishedDailyCount: publishedTotal / durationDays,
    avgInProgressDailyCount: dailyInProgressTotal / durationDays,
  }
}

const getTeamUserIdentities = (manuscript, teamName) => {
  const team = manuscript.teams.find(t => t.name === teamName)
  if (!team) return []
  const idents = []
  team.users.forEach(u => {
    if (!idents.includes(u.defaultIdentity)) idents.push(u.defaultIdentity)
  })
  return idents
}

const getManuscriptsActivity = async (startDate, endDate, ctx) => {
  const query = ctx.models.Manuscript.query()
    .withGraphFetched('[teams.[users.[defaultIdentity]]]')
    .where('created', '>=', new Date(startDate))
    .where('created', '<', new Date(endDate))
    .where({ parentId: null })
    .orderBy('created')

  const manuscripts = await query

  return manuscripts.map(m => {
    const editors = getTeamUserIdentities(m, 'Senior Editor')
    getTeamUserIdentities(m, 'Handling Editor').forEach(ident => {
      if (!editors.some(i => i.id === ident.id)) editors.push(ident)
    })

    let statusLabel
    if (m.published) {
      if (m.status === 'accepted') statusLabel = 'published'
      else statusLabel = `published, ${m.status}`
    } else statusLabel = m.status

    statusLabel = capitalize(statusLabel)

    return {
      shortId: m.shortId.toString(),
      entryDate: getIsoDateString(m.created),
      title: m.meta.title,
      authors: getTeamUserIdentities(m, 'Author'),
      editors,
      reviewers: getTeamUserIdentities(m, 'Reviewers'),
      status: statusLabel,
      publishedDate: getIsoDateString(m.published),
    }
  })
}

const getHandlingEditorsActivity = async (startDate, endDate, ctx) => {
  const query = ctx.models.Manuscript.query()
    .withGraphFetched(
      '[teams.[users.[defaultIdentity]], manuscriptVersions(orderByCreated)]',
    )
    .where('created', '>=', new Date(startDate))
    .where('created', '<', new Date(endDate))
    .where({ parentId: null })
    .orderBy('created')

  const manuscripts = await query

  const editorsData = {} // Map by user id

  manuscripts.forEach(m => {
    const editors = getTeamUserIdentities(m, 'Handling Editor')
    const wasGivenToReviewers = !!m.teams.find(t => t.name === 'Reviewers')
    const wasRevised = m.manuscriptVersions.length > 0

    editors.forEach(e => {
      let editorData = editorsData[e.id]

      if (!editorData) {
        editorData = {
          name: e.name,
          assignedCount: 0,
          givenToReviewersCount: 0,
          revisedCount: 0,
          rejectedCount: 0,
          acceptedCount: 0,
          publishedCount: 0,
        }
        editorsData[e.id] = editorData
      }

      editorData.assignedCount += 1
      if (wasGivenToReviewers) editorData.givenToReviewersCount += 1
      if (wasRevised) editorData.revisedCount += 1
      if (m.status === 'rejected') editorData.rejectedCount += 1
      else if (m.published || m.status === 'accepted')
        editorData.acceptedCount += 1
      if (m.published) editorData.publishedCount += 1
    })
  })

  return Object.values(editorsData)
}

const getReviewersActivity = async (startDate, endDate, ctx) => {
  const query = ctx.models.Manuscript.query()
    .withGraphFetched(
      '[teams.[users.[defaultIdentity], members], reviews, manuscriptVersions(orderByCreated)]',
    )
    .where('created', '>=', new Date(startDate))
    .where('created', '<', new Date(endDate))
    .where({ parentId: null })
    .orderBy('created')

  const manuscripts = await query

  const reviewersData = {} // Map by user id

  manuscripts.forEach(m => {
    const reviewersTeam = m.teams.find(t => t.name === 'Reviewers')
    if (!reviewersTeam) return // continue

    reviewersTeam.members.forEach(member => {
      const reviewer = {
        inviteDate: member.created,
        id: member.userId,
        status: member.status,
      }

      const review = m.reviews.find(
        r => !r.isDecision && r.userId === reviewer.id,
      )

      if (!review) return // continue

      // eslint-disable-next-line no-param-reassign
      reviewer.recommendation = review.recommendation
      // eslint-disable-next-line no-param-reassign
      reviewer.duration = review.updated - reviewer.inviteDate

      let reviewerData = reviewersData[reviewer.id]

      if (!reviewerData) {
        const reviewerUser = reviewersTeam.users.find(u => u.id === reviewer.id)

        const name = reviewerUser
          ? reviewerUser.defaultIdentity.name
          : reviewer.id

        reviewerData = {
          name,
          invitesCount: 0,
          declinedCount: 0,
          reviewsCompletedCount: 0,
          reviewDurationsTotal: 0,
          reviewsCount: 0,
          reccReviseCount: 0,
          reccAcceptCount: 0,
          reccRejectCount: 0,
        }
        reviewersData[reviewer.id] = reviewerData
      }

      reviewerData.invitesCount += 1
      if (reviewer.status === 'declined') reviewerData.declinedCount += 1
      else if (reviewer.status === 'completed')
        reviewerData.reviewsCompletedCount += 1
      reviewerData.reviewDurationsTotal += reviewer.duration
      reviewerData.reviewsCount += 1
      if (reviewer.recommendation === 'revise')
        reviewerData.reccReviseCount += 1
      else if (reviewer.recommendation === 'accept')
        reviewerData.reccAcceptCount += 1
      else if (reviewer.recommendation === 'reject')
        reviewerData.reccRejectCount += 1
    })
  })

  return Object.values(reviewersData).map(d => ({
    name: d.name,
    invitesCount: d.invitesCount,
    declinedCount: d.declinedCount,
    reviewsCompletedCount: d.reviewsCompletedCount,
    avgReviewDuration: d.reviewDurationsTotal / d.reviewsCount / day,
    reccReviseCount: d.reccReviseCount,
    reccAcceptCount: d.reccAcceptCount,
    reccRejectCount: d.reccRejectCount,
  }))
}

const resolvers = {
  Query: {
    async summaryActivity(_, { startDate, endDate, timeZoneOffset }, ctx) {
      return {
        ...(await getDateRangeSummaryStats(startDate, endDate, ctx)),
        publishedTodayCount: await getPublishedTodayCount(timeZoneOffset, ctx),
        revisingNowCount: await getRevisingNowCount(ctx),
        ...(await getDurationsTraces(startDate, endDate, ctx)),
        ...(await getDailyAverageStats(startDate, endDate, ctx)),
      }
    },
    async manuscriptsActivity(_, { startDate, endDate }, ctx) {
      return getManuscriptsActivity(startDate, endDate, ctx)
    },
    handlingEditorsActivity(_, { startDate, endDate }, ctx) {
      return getHandlingEditorsActivity(startDate, endDate, ctx)
    },
    seniorEditorsActivity(_, { startDate, endDate }, ctx) {
      return generateEditorsData()
    },
    async reviewersActivity(_, { startDate, endDate }, ctx) {
      return getReviewersActivity(startDate, endDate, ctx)
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
    seniorEditorsActivity(startDate: DateTime, endDate: DateTime): [HandlingEditorActivity]
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
    avgInProgressDailyCount: Float!
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
    shortId: String!
    entryDate: DateTime!
    title: String!
    authors: [Identity!]!
    editors: [Identity!]!
    reviewers: [Identity!]!
    status: String!
    publishedDate: DateTime
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
