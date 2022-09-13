const models = require('@pubsweet/models')
const importArticlesFromBiorxiv = require('../../import-articles/biorxiv-import')
const importArticlesFromBiorxivWithFullTextSearch = require('../../import-articles/biorxiv-full-text-import')
const importArticlesFromPubmed = require('../../import-articles/pubmed-import')
const { pubsubManager } = require('@coko/server')
const { getReviewForm, getDecisionForm } = require('../../model-review/src/reviewCommsUtils')
const { stripConfidentialDataFromReviews } = require('./manuscriptUtils')
const { replaceImageSrc } = require('../../utils/fileStorageUtils')
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

const importManuscripts = (ctx) => {
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
const manuscript = (ctx) => {
  // eslint-disable-next-line global-require
  const ManuscriptModel = require('./manuscript') // Pubsweet models may initially be undefined, so we require only when resolver runs.

  const manuscript = ManuscriptModel.query()
    .findById(id)
    .withGraphFetched('[teams, channels, files, reviews.user]')

  const user = ctx.user
    ? models.User.query().findById(ctx.user)
    : null

  if (!manuscript) return null

  if (!manuscript.meta) {
    manuscript.meta = {}
  }

  // manuscript.files = await getFilesWithUrl(manuscript.files)
  // const forms = await models.Form.query()
  // await regenerateFileUrisInReviews(manuscript, forms)

  if (typeof manuscript.meta.source === 'string') {
    manuscript.meta.source = replaceImageSrc(
      manuscript.meta.source,
      manuscript.files,
      'medium',
    )
  }

  manuscript.meta.notes = (manuscript.meta || {}).notes || [
    {
      notesType: 'fundingAcknowledgement',
      content: '',
    },
    {
      notesType: 'specialInstructions',
      content: '',
    },
  ]
  manuscript.decision = ''

  manuscript.manuscriptVersions = manuscript.getManuscriptVersions()

  if (
    user &&
    !user.admin &&
    manuscript.reviews &&
    manuscript.reviews.length &&
    !(isEditorOfManuscript(ctx.user, manuscript))
  ) {
    const reviewForm = getReviewForm()
    const decisionForm = getDecisionForm()
    manuscript.reviews = stripConfidentialDataFromReviews(
      manuscript.reviews,
      reviewForm,
      decisionForm,
      ctx.user,
    )
  }

  return repackageForGraphql(manuscript)
}

module.exports = {
  getIdOfFirstVersionOfManuscript,
  getIdOfLatestVersionOfManuscript,
  importManuscripts,
  manuscript,
}
