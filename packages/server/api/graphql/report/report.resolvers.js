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
      const [
        dateRangeSummaryStats,
        publishedTodayCount,
        revisingNowCount,
        durationsTraces,
        dailyAverageStats,
      ] = await Promise.all([
        getDateRangeSummaryStats(startDate, endDate, groupId),
        getPublishedTodayCount(groupId, timeZoneOffset),
        getRevisingNowCount(groupId),
        getDurationsTraces(startDate, endDate, groupId),
        getDailyAverageStats(startDate, endDate, groupId),
      ])

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
