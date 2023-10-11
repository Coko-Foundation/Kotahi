/* eslint-disable no-unused-vars */
const { useTransaction, logger } = require('@coko/server')

/* eslint-disable-next-line import/no-unresolved */
const Team = require('../server/model-team/src/team')

exports.up = async knex => {
  try {
    return useTransaction(async trx => {
      const authorTeams = await Team.query(trx)
        .where('role', 'author')
        .withGraphFetched('[manuscript, members]')

      // eslint-disable-next-line no-restricted-syntax
      for (const authorTeam of authorTeams) {
        const submitterId = authorTeam.manuscript?.submitterId

        // eslint-disable-next-line no-restricted-syntax
        for (const member of authorTeam.members) {
          // Check if the member's userId is not equal to the submitterId
          if (member.userId !== submitterId) {
            // increased the created date for invited author by 60 seconds
            const updatedDate = new Date(member.created.getTime() + 60000)

            // eslint-disable-next-line no-await-in-loop
            await member.$query(trx).patch({ created: updatedDate })
          }
        }
      }
    })
  } catch (error) {
    throw new Error(error)
  }
}
