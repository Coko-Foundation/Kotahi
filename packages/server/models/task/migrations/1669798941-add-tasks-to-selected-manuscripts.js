const { logger } = require('@coko/server')

// Paths are relative to the generated migrations folder
/* eslint-disable-next-line import/no-unresolved, import/extensions */
const Manuscript = require('../models/manuscript/manuscript.model')

const {
  populateTemplatedTasksForManuscript,
  /* eslint-disable-next-line import/no-unresolved, import/extensions */
} = require('../server/model-task/src/taskCommsUtils')

exports.up = async knex => {
  logger.info(
    'Populating tasks for manuscripts that have been selected but have no tasks...',
  )

  const selectedManuscriptsWithoutTasks = await Manuscript.query()
    .select('manuscripts.id')
    .whereRaw("submission->>'labels' IS NOT NULL")
    .whereNotExists(Manuscript.relatedQuery('tasks'))

  logger.info(
    `Found ${selectedManuscriptsWithoutTasks.length} such manuscripts...`,
  )

  for (let i = 0; i < selectedManuscriptsWithoutTasks.length; i += 1) {
    const m = selectedManuscriptsWithoutTasks[i]
    // Do this in loop rather than Promise.all to avoid exhausting available connections
    // eslint-disable-next-line no-await-in-loop
    await populateTemplatedTasksForManuscript(m.id)
  }

  logger.info(
    `Populated tasks for ${selectedManuscriptsWithoutTasks.length} manuscripts.`,
  )
}
