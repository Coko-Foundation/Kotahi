const models = require('@pubsweet/models')
const config = require('config')
const { pubsubManager } = require('@coko/server')
const importArticlesFromBiorxiv = require('../../import-articles/biorxiv-import')
const importArticlesFromBiorxivWithFullTextSearch = require('../../import-articles/biorxiv-full-text-import')
const importArticlesFromPubmed = require('../../import-articles/pubmed-import')
const importArticlesFromSemanticScholar = require('../../import-articles/semantic-scholar-papers-import')
const { runImports } = require('../../plugins/imports')

const { getPubsub } = pubsubManager

const importsInProgress = new Set()

const shouldRunDefaultImportsForColab = [true, 'true'].includes(
  config['import-for-prc'].default_import,
)

const importManuscripts = async (groupId, ctx) => {
  const key = `${groupId}-imports`
  if (importsInProgress.has(key)) return false

  try {
    importsInProgress.add(key)

    const activeConfig = await models.Config.query().findOne({
      groupId,
      active: true,
    })

    const evaluatedStatusString = ['preprint2', 'preprint1'].includes(
      activeConfig.formData.instanceName,
    )
      ? 'evaluated'
      : 'accepted'

    const promises = [runImports(groupId, evaluatedStatusString, ctx.user)]

    if (activeConfig.formData.instanceName === 'preprint2') {
      promises.push(importArticlesFromBiorxiv(groupId, ctx))
      promises.push(importArticlesFromPubmed(groupId, ctx))
    } else if (
      activeConfig.formData.instanceName === 'prc' &&
      shouldRunDefaultImportsForColab
    ) {
      promises.push(importArticlesFromBiorxivWithFullTextSearch(groupId, ctx))
    }

    if (!promises.length) return false

    Promise.all(promises)
      .catch(error => console.error(error))
      .finally(async () => {
        const pubsub = await getPubsub()
        pubsub.publish('IMPORT_MANUSCRIPTS_STATUS', {
          manuscriptsImportStatus: true,
        })
      })

    return true
  } finally {
    importsInProgress.delete(key)
  }
}

const importManuscriptsFromSemanticScholar = async (groupId, ctx) => {
  const key = `${groupId}-SemanticScholar`
  if (importsInProgress.has(key)) return false

  try {
    importsInProgress.add(key)

    const activeConfig = await models.Config.query().findOne({
      groupId,
      active: true,
    })

    const promises = []

    if (
      activeConfig.formData.instanceName === 'prc' &&
      shouldRunDefaultImportsForColab
    ) {
      promises.push(importArticlesFromSemanticScholar(groupId, ctx))
    }

    if (!promises.length) return false

    Promise.all(promises)
      .catch(error => console.error(error))
      .finally(async () => {
        const pubsub = await getPubsub()
        pubsub.publish('IMPORT_MANUSCRIPTS_STATUS', {
          manuscriptsImportStatus: true,
        })
      })

    return true
  } finally {
    importsInProgress.delete(key)
  }
}

module.exports = {
  importManuscripts,
  importManuscriptsFromSemanticScholar,
}
