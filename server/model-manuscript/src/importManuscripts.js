const models = require('@pubsweet/models')
const { pubsubManager } = require('@coko/server')
const importArticlesFromBiorxiv = require('../../import-articles/biorxiv-import')
const importArticlesFromBiorxivWithFullTextSearch = require('../../import-articles/biorxiv-full-text-import')
const importArticlesFromPubmed = require('../../import-articles/pubmed-import')
const importArticlesFromSemanticScholar = require('../../import-articles/semantic-scholar-papers-import')
const { runImports } = require('../../plugins/imports')

const { getPubsub } = pubsubManager

let isImportInProgress = false
let isImportingFromSemanticScholarInProgress = false

const importManuscripts = async (groupId, ctx) => {
  if (isImportInProgress) return false
  isImportInProgress = true

  const activeConfig = await models.Config.query().findOne({
    groupId,
    active: true,
  })

  await runImports(groupId, ctx.user)

  const promises = []

  if (activeConfig.formData.instanceName === 'ncrc') {
    promises.push(importArticlesFromBiorxiv(groupId, ctx))
    promises.push(importArticlesFromPubmed(groupId, ctx))
  } else if (activeConfig.formData.instanceName === 'colab') {
    promises.push(importArticlesFromBiorxivWithFullTextSearch(groupId, ctx))
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

const importManuscriptsFromSemanticScholar = async (groupId, ctx) => {
  if (isImportingFromSemanticScholarInProgress) return false
  isImportingFromSemanticScholarInProgress = true

  const activeConfig = await models.Config.query().findOne({
    groupId,
    active: true,
  })

  const promises = []

  if (activeConfig.formData.instanceName === 'colab') {
    promises.push(importArticlesFromSemanticScholar(groupId, ctx))
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

module.exports = {
  importManuscripts,
  importManuscriptsFromSemanticScholar,
}
