const models = require('@pubsweet/models')
const { ensureJsonIsParsed } = require('../../utils/objectUtils')
const generateMovingAverages = require('./movingAverages')

const editorTeams = ['Senior Editor', 'Handling Editor', 'Editor']

/** Get date string in the form yyyy-mm-dd */
const getIsoDateString = date => (date ? date.toISOString().slice(0, 10) : null)

/** Return mean of array, ignoring null or undefined items; return null if no valid values found */
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

/** Find the first element that meets the startCondition function, and return the subarray starting at that index.
 * If no element meets startCondition, return an empty array
 */
const trim = (array, startCondition) => {
  const start = array.findIndex(element => startCondition(element))
  if (start < 0) return []
  return array.slice(start)
}

const day = 24 * 60 * 60 * 1000
const week = day * 7

const dateSorter = (d0, d1) => d0.getTime() - d1.getTime()

/** Return the datetime of the most recent midnight in the given timezone */
const getLastMidnightInTimeZone = timeZoneOffset => {
  const transposedDate = new Date(Date.now() + timeZoneOffset * 60000)
  transposedDate.setUTCHours(0)
  transposedDate.setUTCMinutes(0)
  transposedDate.setUTCSeconds(0)
  transposedDate.setUTCMilliseconds(0)
  return new Date(transposedDate.getTime() - timeZoneOffset * 60000)
}

const getVersionsAsArray = manuscript => {
  if (manuscript.manuscriptVersions)
    return [manuscript, ...manuscript.manuscriptVersions]
  return [manuscript]
}

/** Find the earliest manuscript version providing non-falsey result for func; return that result. Otherwise null.
 * func should expect as its single parameter a manuscript version.
 * Assumes versions are already date-ordered.
 */
const seekFromEarliestVersion = (m, func) => {
  const manuscripts = getVersionsAsArray(m)

  for (let i = 0; i < manuscripts.length; i += 1) {
    const result = func(manuscripts[i])
    if (result) return result
  }

  return null
}

/** Find the latest manuscript version providing non-falsey result for func; return that result. Otherwise null.
 * func should expect as its single parameter a manuscript version.
 * Assumes versions are already date-ordered.
 */
const seekFromLatestVersion = (m, func) => {
  const manuscripts = getVersionsAsArray(m)

  for (let i = manuscripts.length - 1; i >= 0; i -= 1) {
    const result = func(manuscripts[i])
    if (result) return result
  }

  return null
}

/** Get the last manuscript version. Assumes the versions are already date ordered. */
const getLastVersion = m => {
  if (!m.manuscriptVersions || m.manuscriptVersions.length <= 0) return m
  return m.manuscriptVersions[m.manuscriptVersions.length - 1]
}

const getFinalStatus = m => getLastVersion(m).status

/** Get reviews for a single ms version, excluding "decision" reviews */
const getTrueReviews = m =>
  m.reviews ? m.reviews.filter(r => !r.isDecision) : []

/** Get duration from first reviewer assigned until last review update (for first revision of manuscript only) */
const getReviewingDuration = manuscript => {
  const reviewingStart = seekFromEarliestVersion(manuscript, m => {
    if (!m.teams) return null
    const reviewersTeam = m.teams.find(t => t.name === 'Reviewers')
    if (!reviewersTeam) return null
    return reviewersTeam.created.getTime()
  })

  if (!reviewingStart) return null

  const reviewingEnd = seekFromLatestVersion(manuscript, m => {
    const reviews = getTrueReviews(m)
    if (reviews.length <= 0) return null
    return reviews.reduce(
      (accum, curr) => Math.max(accum, curr.updated.getTime()),
      reviews[0].updated.getTime(),
    )
  })

  if (!reviewingEnd) return null

  return reviewingEnd - reviewingStart
}

const getLastPublishedDate = manuscript =>
  seekFromLatestVersion(manuscript, m => m.published)

/** From submission until last publish date */
const getDurationUntilPublished = m => {
  let start = m.submittedDate
  if (!start) start = m.created
  const publishedDate = getLastPublishedDate(m)
  return publishedDate && start
    ? publishedDate.getTime() - start.getTime()
    : null
}

const getCompletedDate = m => {
  const lastPublishedDate = getLastPublishedDate(m)
  if (lastPublishedDate) return lastPublishedDate

  const rejectionReview = getLastVersion(m).reviews.find(
    r => r.isDecision && r.recommendation === 'reject',
  )

  if (rejectionReview) return rejectionReview.updated
  return null
}

const wasSubmitted = manuscript =>
  manuscript.status && manuscript.status !== 'new'

const wasAssignedToEditor = manuscript =>
  seekFromEarliestVersion(manuscript, m =>
    m.teams.some(t => ['Senior Editor', 'Handling Editor'].includes(t.name)),
  )

const reviewerWasInvited = manuscript =>
  seekFromEarliestVersion(manuscript, m =>
    m.teams.some(t => t.name === 'Reviewers'),
  )

const reviewInviteWasAccepted = manuscript =>
  !!seekFromEarliestVersion(manuscript, m => getTrueReviews(m).length > 0)

const wasReviewed = manuscript =>
  seekFromEarliestVersion(manuscript, m =>
    getTrueReviews(m).some(r => r.recommendation),
  )

const wasAccepted = manuscript =>
  seekFromLatestVersion(manuscript, m =>
    ['accepted', 'published'].includes(m.status),
  )

const wasRejected = m => getLastVersion(m).status === 'rejected'

const isRevising = m =>
  ['revise', 'revising'].includes(getLastVersion(m).status)

const getDateRangeSummaryStats = async (startDate, endDate, groupId, ctx) => {
  const manuscripts = await models.Manuscript.query()
    .withGraphFetched(
      '[teams, reviews, manuscriptVersions(orderByCreatedDesc).[teams, reviews]]',
    )
    .where('created', '>=', new Date(startDate))
    .where('created', '<', new Date(endDate))
    .where({ parentId: null, groupId })
    .whereNot({ isHidden: true })
    .orderBy('created')

  const avgPublishTimeDays =
    mean(manuscripts.map(m => getDurationUntilPublished(m))) / day

  const avgReviewTimeDays =
    mean(manuscripts.map(m => getReviewingDuration(m))) / day

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
    if (wasRejected(m)) rejectedCount += 1
    if (isRevising(m)) revisingCount += 1
    if (wasAccepted(m)) acceptedCount += 1
    if (getLastPublishedDate(m)) publishedCount += 1
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

const getPublishedTodayCount = async (groupId, timeZoneOffset, ctx) => {
  const midnight = getLastMidnightInTimeZone(timeZoneOffset)

  const query = models.Manuscript.query()
    .where({ groupId })
    .whereNot({ isHidden: true })
    .where('published', '>=', midnight) // TODO this will double-count manuscripts republished twice today

  return query.resultSize()
}

const getRevisingNowCount = async (groupId, ctx) => {
  const manuscripts = await models.Manuscript.query()
    .withGraphFetched('[manuscriptVersions(orderByCreatedDesc)]')
    .where({ parentId: null, groupId })
    .whereNot({ isHidden: true })

  return manuscripts.filter(m =>
    ['revise', 'revising'].includes(getFinalStatus(m)),
  ).length
}

const getDurationsTraces = async (startDate, endDate, groupId, ctx) => {
  const windowSizeForAvg = week
  const smoothingSize = day

  const dataStart = startDate - windowSizeForAvg / 2

  const manuscripts = await models.Manuscript.query()
    .withGraphFetched(
      '[reviews, manuscriptVersions(orderByCreatedDesc).[reviews]]',
    )
    .where('created', '>=', new Date(dataStart))
    .where('created', '<', new Date(endDate))
    .where({ parentId: null, groupId })
    .whereNot({ isHidden: true })
    .orderBy('created')

  const durations = []

  manuscripts.forEach(m => {
    const submittedDate = m.submittedDate ? m.submittedDate.getTime() : null
    if (!submittedDate || submittedDate >= endDate) return // continue
    const completedDate = getCompletedDate(m)

    let reviewDuration = getReviewingDuration(m) / day
    if (!reviewDuration && reviewDuration !== 0) reviewDuration = null

    const fullDuration = completedDate
      ? (completedDate - submittedDate) / day
      : null

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

const getDailyAverageStats = async (startDate, endDate, groupId, ctx) => {
  const dataStart = startDate - 365 * day // TODO: any better way to ensure we get all manuscripts still in progress during this date range?

  const manuscripts = await models.Manuscript.query()
    .withGraphFetched(
      '[reviews, manuscriptVersions(orderByCreatedDesc).[reviews]]',
    )
    .where('created', '>=', new Date(dataStart))
    .where('created', '<', new Date(endDate))
    .where({ parentId: null, groupId })
    .whereNot({ isHidden: true })
    .orderBy('created')

  const orderedSubmissionDates = manuscripts
    .map(m => m.submittedDate)
    .filter(d => d)
    .sort(dateSorter)

  const orderedCompletionDates = manuscripts
    .map(m => getCompletedDate(m))
    .filter(d => d)
    .sort(dateSorter)

  const publishedTotal = manuscripts.filter(m => {
    const pubDate = getLastPublishedDate(m)
    return pubDate && pubDate >= startDate
  }).length

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

/** Get all users that are members of the given team or teams. teamNameOrNames may be a string or array of strings. */
const getTeamUsers = (manuscript, teamNameOrNames) => {
  const teamNames = Array.isArray(teamNameOrNames)
    ? teamNameOrNames
    : [teamNameOrNames]

  const users = []
  const manuscripts = getVersionsAsArray(manuscript)
  manuscripts.forEach(m => {
    m.teams
      .filter(t => teamNames.includes(t.name))
      .forEach(team => {
        team.users.forEach(user => {
          if (!users.some(u => u.id === user.id)) users.push(user)
        })
      })
  })

  return users
}

const getReviewersAndLatestStatuses = ms => {
  const allReviewers = getTeamUsers(ms, 'Reviewers').map(u => ({
    id: u.id,
    name: u.username || u.email || u.defaultIdentity.identifier,
  }))

  const currentTeam = getLastVersion(ms).teams.find(t => t.name === 'Reviewers')
  if (!currentTeam) return allReviewers

  currentTeam.members.forEach(m => {
    const reviewer = allReviewers.find(r => r.id === m.userId)
    if (reviewer) reviewer.status = m.status
  })
  return allReviewers
}

/** True if all members of this review team are either completed or rejected, and at least one has completed. */
const allReviewersAreComplete = team => {
  return (
    team &&
    team.members &&
    team.members.every(m => ['completed', 'rejected'].includes(m.status)) &&
    team.members.some(m => m.status === 'completed')
  )
}

/** Returns an array of review durations for each manuscript version.
 * The last duration will be null if the review is still in progress. */
const getVersionReviewDurations = ms => {
  const reviewDurations = []
  const versions = getVersionsAsArray(ms)
  versions.forEach((v, i) => {
    const reviewTeam = v.teams.find(t => t.name === 'Reviewers')
    if (!reviewTeam && i === versions.length - 1) return // continue
    if (i === versions.length - 1 && !allReviewersAreComplete(reviewTeam))
      reviewDurations.push(null)
    else if (reviewTeam)
      reviewDurations.push((reviewTeam.updated - reviewTeam.created) / day)
    else reviewDurations.push(0)
  })
  return reviewDurations
}

const getManuscriptsActivity = async (startDate, endDate, groupId, ctx) => {
  const manuscripts = await models.Manuscript.query()
    .withGraphFetched(
      '[teams.[users.[defaultIdentity], members], manuscriptVersions(orderByCreatedDesc).[teams.[users.[defaultIdentity], members]]]',
    )
    .where('created', '>=', new Date(startDate))
    .where('created', '<', new Date(endDate))
    .where({ parentId: null, groupId })
    .whereNot({ isHidden: true })
    .orderBy('created')

  return manuscripts.map(m => {
    const lastVer = getLastVersion(m)
    let status
    if (lastVer.published) {
      if (['accepted', 'published'].includes(lastVer.status))
        status = 'published'
      else status = `published, ${lastVer.status}`
    } else status = lastVer.status

    return {
      shortId: m.shortId.toString(),
      entryDate: getIsoDateString(m.created),
      title: lastVer.meta.title,
      authors: getTeamUsers(m, 'Author'),
      editors: getTeamUsers(m, editorTeams),
      reviewers: getReviewersAndLatestStatuses(m),
      status,
      publishedDate: getIsoDateString(getLastPublishedDate(m)),
      versionReviewDurations: getVersionReviewDurations(m),
    }
  })
}

const getEditorsActivity = async (startDate, endDate, groupId, ctx) => {
  const manuscripts = await models.Manuscript.query()
    .withGraphFetched(
      '[teams.[users.[defaultIdentity]], manuscriptVersions(orderByCreatedDesc).[teams.[users.[defaultIdentity]]]]',
    )
    .where('created', '>=', new Date(startDate))
    .where('created', '<', new Date(endDate))
    .where({ parentId: null, groupId })
    .whereNot({ isHidden: true })
    .orderBy('created')

  const editorsData = {} // Map by user id

  manuscripts.forEach(m => {
    const wasGivenToReviewers = !!seekFromEarliestVersion(m, manuscript =>
      manuscript.teams.find(t => t.name === 'Reviewers'),
    )

    const wasRevised = m.manuscriptVersions.length > 0

    getTeamUsers(m, editorTeams).forEach(e => {
      let editorData = editorsData[e.id]

      if (!editorData) {
        editorData = {
          name: e.username || e.email || e.defaultIdentity.identifier,
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
      const status = getFinalStatus(m)
      const wasPublished = !!getLastPublishedDate(m)
      if (status === 'rejected') editorData.rejectedCount += 1
      else if (wasPublished || status === 'accepted')
        editorData.acceptedCount += 1
      if (wasPublished) editorData.publishedCount += 1
    })
  })

  return Object.values(editorsData)
}

const getReviewersActivity = async (startDate, endDate, groupId, ctx) => {
  const manuscripts = await models.Manuscript.query()
    .withGraphFetched(
      '[teams.[users.[defaultIdentity], members], reviews, manuscriptVersions(orderByCreatedDesc).[teams.[users.[defaultIdentity], members], reviews]]',
    )
    .where('created', '>=', new Date(startDate))
    .where('created', '<', new Date(endDate))
    .where({ parentId: null, groupId })
    .whereNot({ isHidden: true })
    .orderBy('created')

  const reviewersData = {} // Map by user id

  manuscripts.forEach(manuscript =>
    getVersionsAsArray(manuscript).forEach(m => {
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
        const reviewJsonData = ensureJsonIsParsed(review.jsonData)

        // eslint-disable-next-line no-param-reassign
        reviewer.recommendation = reviewJsonData.verdict // TODO this expects the field to be named 'verdict'. Could be more robust.
        // eslint-disable-next-line no-param-reassign
        reviewer.duration = review.updated - reviewer.inviteDate

        let reviewerData = reviewersData[reviewer.id]

        if (!reviewerData) {
          const reviewerUser = reviewersTeam.users.find(
            u => u.id === reviewer.id,
          )

          const name = reviewerUser
            ? reviewerUser.userName ||
              reviewerUser.email ||
              reviewerUser.defaultIdentity.identifier
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
    }),
  )

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

const getAuthorsActivity = async (startDate, endDate, groupId, ctx) => {
  const query = models.Manuscript.query()
    .withGraphFetched(
      '[teams.[users.[defaultIdentity]], manuscriptVersions(orderByCreatedDesc).[teams.[users.[defaultIdentity]]]]',
    )
    .where('created', '>=', new Date(startDate))
    .where('created', '<', new Date(endDate))
    .where({ parentId: null, groupId })
    .whereNot({ isHidden: true })
    .orderBy('created')

  const manuscripts = await query

  const authorsData = {} // Map by user id

  manuscripts.forEach(m => {
    getTeamUsers(m, 'Author').forEach(a => {
      let authorData = authorsData[a.id]

      if (!authorData) {
        authorData = {
          name: a.username || a.email || a.defaultIdentity.identifier,
          unsubmittedCount: 0,
          submittedCount: 0,
          rejectedCount: 0,
          revisionCount: 0,
          acceptedCount: 0,
          publishedCount: 0,
        }
        authorsData[a.id] = authorData
      }

      if (!m.status || m.status === 'new') authorData.unsubmittedCount += 1
      else authorData.submittedCount += 1
      const finalStatus = getFinalStatus(m)
      const wasPublished = !!getLastPublishedDate(m)
      if (finalStatus === 'rejected') authorData.rejectedCount += 1
      if (finalStatus === 'revise' || m.manuscriptVersions.length > 0)
        authorData.revisionCount += 1
      if (wasPublished || finalStatus === 'accepted')
        authorData.acceptedCount += 1
      if (wasPublished) authorData.publishedCount += 1
    })
  })

  return Object.values(authorsData)
}

const resolvers = {
  Query: {
    async summaryActivity(
      _,
      { startDate, endDate, groupId, timeZoneOffset },
      ctx,
    ) {
      const [
        dateRangeSummaryStats,
        publishedTodayCount,
        revisingNowCount,
        durationsTraces,
        dailyAverageStats,
      ] = await Promise.all([
        getDateRangeSummaryStats(startDate, endDate, groupId, ctx),
        getPublishedTodayCount(groupId, timeZoneOffset, ctx),
        getRevisingNowCount(groupId, ctx),
        getDurationsTraces(startDate, endDate, groupId, ctx),
        getDailyAverageStats(startDate, endDate, groupId, ctx),
      ])

      return {
        ...dateRangeSummaryStats,
        publishedTodayCount,
        revisingNowCount,
        ...durationsTraces,
        ...dailyAverageStats,
      }
    },
    manuscriptsActivity(_, { startDate, endDate, groupId }, ctx) {
      return getManuscriptsActivity(startDate, endDate, groupId, ctx)
    },
    editorsActivity(_, { startDate, endDate, groupId }, ctx) {
      return getEditorsActivity(startDate, endDate, groupId, ctx)
    },
    reviewersActivity(_, { startDate, endDate, groupId }, ctx) {
      return getReviewersActivity(startDate, endDate, groupId, ctx)
    },
    authorsActivity(_, { startDate, endDate, groupId }, ctx) {
      return getAuthorsActivity(startDate, endDate, groupId, ctx)
    },
  },
}

const typeDefs = `
  extend type Query {
    summaryActivity(startDate: DateTime, endDate: DateTime, groupId: ID!, timeZoneOffset: Int) : SummaryActivity
    manuscriptsActivity(startDate: DateTime, endDate: DateTime, groupId: ID!): [ManuscriptActivity]
    editorsActivity(startDate: DateTime, endDate: DateTime, groupId: ID!): [EditorActivity]
    reviewersActivity(startDate: DateTime, endDate: DateTime, groupId: ID!): [ReviewerActivity]
    authorsActivity(startDate: DateTime, endDate: DateTime, groupId: ID!): [AuthorActivity]
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

  type ReviewerWithStatus {
    id: ID!
    name: String!
    status: String
  }

  type ManuscriptActivity {
    shortId: String!
    entryDate: DateTime!
    title: String!
    authors: [User!]!
    editors: [User!]!
    reviewers: [ReviewerWithStatus!]!
    status: String!
    publishedDate: DateTime
    versionReviewDurations: [Float]!
  }

  type EditorActivity {
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
