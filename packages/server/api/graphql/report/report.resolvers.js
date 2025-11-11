const {
  getAuthorsActivity,
  getDailyAverageStats,
  getDateRangeSummaryStats,
  getDurationsTraces,
  getEditorsActivity,
  getManuscriptsActivity,
  getPublishedTodayCount,
  getReviewersActivity,
  getRevisingNowCount,
} = require('../../../controllers/report.controllers')

module.exports = {
  Query: {
    async summaryActivity(_, { startDate, endDate, groupId, timeZoneOffset }) {
      const revisingNowCount = await getRevisingNowCount(groupId)

      const publishedTodayCount = await getPublishedTodayCount(
        groupId,
        timeZoneOffset,
      )

      const dateRangeSummaryStats = await getDateRangeSummaryStats(
        startDate,
        endDate,
        groupId,
      )

      const durationsTraces = await getDurationsTraces(
        startDate,
        endDate,
        groupId,
      )

      const dailyAverageStats = await getDailyAverageStats(
        startDate,
        endDate,
        groupId,
      )

      return {
        ...dateRangeSummaryStats,
        publishedTodayCount,
        revisingNowCount,
        ...durationsTraces,
        ...dailyAverageStats,
      }
    },
    manuscriptsActivity(_, { startDate, endDate, groupId }) {
      return getManuscriptsActivity(startDate, endDate, groupId)
    },
    editorsActivity(_, { startDate, endDate, groupId }) {
      return getEditorsActivity(startDate, endDate, groupId)
    },
    reviewersActivity(_, { startDate, endDate, groupId }) {
      return getReviewersActivity(startDate, endDate, groupId)
    },
    authorsActivity(_, { startDate, endDate, groupId }) {
      return getAuthorsActivity(startDate, endDate, groupId)
    },
  },
}
