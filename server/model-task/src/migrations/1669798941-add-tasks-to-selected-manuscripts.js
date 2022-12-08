const { logger } = require('@coko/server')

// Paths are relative to the generated migrations folder
/* eslint-disable-next-line import/no-unresolved */
const Manuscript = require('../server/model-manuscript/src/manuscript')

const {
  populateTemplatedTasksForManuscript,
  /* eslint-disable-next-line import/no-unresolved */
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

  await Promise.all(
    selectedManuscriptsWithoutTasks.map(async m =>
      populateTemplatedTasksForManuscript(m.id),
    ),
  )

  logger.info(
    `Populated tasks for ${selectedManuscriptsWithoutTasks.length} manuscripts.`,
  )
}
