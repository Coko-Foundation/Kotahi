const config = require('config')

const models = require('@pubsweet/models')
const { pubsubManager } = require('@coko/server')
const importArticlesFromBiorxiv = require('../../import-articles/biorxiv-import')
const importArticlesFromBiorxivWithFullTextSearch = require('../../import-articles/biorxiv-full-text-import')
const importArticlesFromPubmed = require('../../import-articles/pubmed-import')
const importArticlesFromSemanticScholar = require('../../import-articles/semantic-scholar-papers-import')

const { getPubsub } = pubsubManager

/** For a given versionId, find the first/original version of that manuscript and return its ID */
const getIdOfFirstVersionOfManuscript = async versionId =>
  (await models.Manuscript.query().select('parentId').findById(versionId))
    .parentId || versionId

/** For a given versionId, find the latest version of that manuscript and return its ID */
const getIdOfLatestVersionOfManuscript = async versionId => {
  const firstVersionId = await getIdOfFirstVersionOfManuscript(versionId)

  return (
    await models.Manuscript.query()
      .select('id')
      .where({ parentId: firstVersionId })
      .orWhere({ id: firstVersionId })
      .orderBy('created', 'desc')
      .limit(1)
  )[0].id
}

let isImportInProgress = false
let isImportingFromSemanticScholarInProgress = false

const importManuscripts = async ctx => {
  if (isImportInProgress) return false
  isImportInProgress = true

  const promises = []

  if (process.env.INSTANCE_NAME === 'ncrc') {
    promises.push(importArticlesFromBiorxiv(ctx))
    promises.push(importArticlesFromPubmed(ctx))
  } else if (process.env.INSTANCE_NAME === 'colab') {
    promises.push(importArticlesFromBiorxivWithFullTextSearch(ctx))
  }

  if (!promises.length) return false

  Promise.all(promises)
    .catch(error => console.error(error))
    .finally(async () => {
      isImportInProgress = false
      const pubsub = await getPubsub()
      pubsub.publish('IMPORT_MANUSCRIPTS_STATUS', {
        manuscriptsImportStatus: true,
      })
    })

  return true
}

const importManuscriptsFromSemanticScholar = ctx => {
  if (isImportingFromSemanticScholarInProgress) return false
  isImportingFromSemanticScholarInProgress = true

  const promises = []

  if (process.env.INSTANCE_NAME === 'colab') {
    promises.push(importArticlesFromSemanticScholar(ctx))
  }

  if (!promises.length) return false

  Promise.all(promises)
    .catch(error => console.error(error))
    .finally(async () => {
      isImportingFromSemanticScholarInProgress = false
      const pubsub = await getPubsub()
      pubsub.publish('IMPORT_MANUSCRIPTS_STATUS', {
        manuscriptsImportStatus: true,
      })
    })

  return true
}

const archiveOldManuscripts = async () => {
  const archivePeriodDays = parseInt(config.manuscripts.archivePeriodDays, 10)
  if (Number.isNaN(archivePeriodDays) || archivePeriodDays < 1) return

  const cutoffDate = new Date(
    new Date().valueOf() - archivePeriodDays * 86400000, // subtracting milliseconds of ARCHIVE_PERIOD_DAYS
  )

  const archivedCount = await models.Manuscript.query()
    .update({ isHidden: true })
    .where('created', '<', cutoffDate)
    .where('status', 'new')
    .whereNot('isHidden', true)
    .where(function subcondition() {
      this.whereRaw(`submission->>'labels' = ''`).orWhereRaw(
        `submission->>'labels' IS NULL`,
      )
    })

  // eslint-disable-next-line no-console
  console.info(
    `Automatically archived ${archivedCount} new, unlabelled manuscripts older than ${archivePeriodDays} days.`,
  )
}

/** Populates hasOverdueTasksForUser field of each manuscript IN PLACE.
 * A task is overdue for the current user if the user is an editor of the manuscript, or the task's assignee. */
const manuscriptHasOverdueTasksForUser = (manuscript, userId) => {
  const now = Date.now()

  const isEditor = manuscript.teams
    .filter(t => ['editor', 'handlingEditor', 'seniorEditor'].includes(t.role))
    .some(t => t.members.some(m => m.userId === userId))

  for (let i = 0; i < manuscript.tasks.length; i += 1) {
    const task = manuscript.tasks[i]

    if (
      (isEditor || task.assigneeUserId === userId) &&
      ['In progress', 'Paused'].includes(task.status) &&
      new Date(task.dueDate) < now
    ) {
      return true
    }
  }

  return false
}

/** Returns true if manuscript exists, is not archived, and is the most recent version */
const manuscriptIsActive = async manuscriptId => {
  const manuscript = await models.Manuscript.query()
    .select('isHidden')
    .findById(manuscriptId)

  if (!manuscript) return false
  const { isHidden } = manuscript

  if (isHidden) return false
  const latestVersionId = await getIdOfLatestVersionOfManuscript(manuscriptId)
  return manuscriptId === latestVersionId
}

/** Returns a list of user IDs for editors, handlingEditors and seniorEditors. */
const getEditorIdsForManuscript = async manuscriptId => {
  const teams = await models.Team.query()
    .where({ objectId: manuscriptId })
    .whereIn('role', ['editor', 'handlingEditor', 'seniorEditor'])
    .withGraphFetched('members')

  return [...new Set(teams.map(t => t.members.map(m => m.userId)).flat())]
}

module.exports = {
  getIdOfFirstVersionOfManuscript,
  getIdOfLatestVersionOfManuscript,
  importManuscripts,
  importManuscriptsFromSemanticScholar,
  archiveOldManuscripts,
  manuscriptHasOverdueTasksForUser,
  manuscriptIsActive,
  getEditorIdsForManuscript,
}
