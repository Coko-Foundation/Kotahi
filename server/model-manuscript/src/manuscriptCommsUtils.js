const models = require('@pubsweet/models')
const { pubsubManager } = require('@coko/server')
const importArticlesFromBiorxiv = require('../../import-articles/biorxiv-import')
const importArticlesFromBiorxivWithFullTextSearch = require('../../import-articles/biorxiv-full-text-import')
const importArticlesFromPubmed = require('../../import-articles/pubmed-import')

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

const importManuscripts = async ctx => {
  if (isImportInProgress) return false
  isImportInProgress = true

  const promises = []

  if (process.env.INSTANCE_NAME === 'ncrc') {
    promises.push(importArticlesFromBiorxiv(ctx))
    promises.push(importArticlesFromPubmed(ctx))
  } else if (process.env.INSTANCE_NAME === 'colab') {
    promises.push(
      importArticlesFromBiorxivWithFullTextSearch(ctx, [
        'transporter*',
        'pump*',
        'gpcr',
        'gating',
        '*-gated',
        '*-selective',
        '*-pumping',
        'protein translocation',
      ]),
    )
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

const currentDate = new Date()
const numberOfDays = process.env.ARCHIVE_PERIOD

const cutoffDate = currentDate.setDate(currentDate.getDate() - numberOfDays)

const archiveOldManuscripts = async () => {
  await models.Manuscript.query()
    .update({ isHidden: true })
    .where('created', '<', cutoffDate)
    .whereRaw(`submission->>'labels' = ''`)
}

module.exports = {
  getIdOfFirstVersionOfManuscript,
  getIdOfLatestVersionOfManuscript,
  importManuscripts,
  archiveOldManuscripts,
}
