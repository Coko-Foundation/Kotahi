const { logger } = require('@coko/server')

const Invitation = require('../invitation.model')

exports.up = async knex => {
  try {
    await knex.schema.table('invitations', table => {
      table.jsonb('suggestedReviewers').defaultTo([])
    })

    // Update status for all existing books
    return Invitation.query().patch({ suggestedReviewers: [] })
  } catch (e) {
    logger.error(e)
    throw new Error(
      `Migration: Invitation: adding suggestedReviewers column failed`,
    )
  }
}

exports.down = async knex => {
  try {
    return knex.schema.table('invitations', table => {
      table.dropColumn('suggestedReviewers')
    })
  } catch (e) {
    logger.error(e)
    throw new Error(
      `Migration: Invitation: removing suggestedReviewers field failed`,
    )
  }
}
