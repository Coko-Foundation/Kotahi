const {
  formatCitationFn,
  formatMultipleCitationsFn,
  getDataciteCslFromDOI,
  getDataciteCslFromTitle,
  getFormattedReferences,
  getMatchingReferences,
  getReferenceFromDoi,
} = require('../../../controllers/reference/reference.controllers')

module.exports = {
  Query: {
    async getDataciteCslFromDOI(_, { input }, ctx) {
      const groupId = ctx.req.headers['group-id']
      return getDataciteCslFromDOI(input, groupId)
    },

    async getDataciteCslFromTitle(_, { input }, ctx) {
      const groupId = ctx.req.headers['group-id']
      return getDataciteCslFromTitle(input, groupId)
    },

    async getFormattedReferences(_, { input }, ctx) {
      const groupId = ctx.req.headers['group-id']
      return getFormattedReferences(input, groupId)
    },

    async getMatchingReferences(_, { input }, ctx) {
      const groupId = ctx.req.headers['group-id']
      return getMatchingReferences(input, groupId)
    },

    async getReferenceFromDoi(_, { doi }, ctx) {
      const groupId = ctx.req.headers['group-id']
      return getReferenceFromDoi(doi, groupId)
    },

    async formatCitation(_, { citation }, ctx) {
      const groupId = ctx.req.headers['group-id']
      return formatCitationFn(citation, groupId)
    },

    async formatMultipleCitations(_, { input }, ctx) {
      const groupId = ctx.req.headers['group-id']
      return formatMultipleCitationsFn(input, groupId)
    },
  },
}
