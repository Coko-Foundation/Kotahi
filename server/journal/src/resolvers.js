const Journal = require('./journal')
// const Manuscript = require('../../manuscript/src/manuscript')

// const isMember = (team, userId) => team && team.members.includes(userId)

// const isUserInGlobalTeams = (globalTeams, user) =>
//   user.admin || globalTeams.some(team => isMember(team, user.id))

// END TO DO

const resolvers = {
  Query: {
    journals: async (_, { where }, ctx) => {
      const journalAll = await Journal.all()
      const journal = journalAll[0]

      // const manuscripts = await ctx.connectors.Manuscript.fetchAll(where, ctx)
      const manuscripts = await ctx.connectors.Manuscript.model.query()
      journal.manuscripts = await ctx.connectors.Manuscript.model.myManuscripts(
        manuscripts,
      )
      await Promise.all(
        journal.manuscripts.map(async manuscript => {
          manuscript.reviews = await manuscript.getReviews()
          return manuscript
        }),
      )
      return journal
    },
  },
}

module.exports = resolvers
