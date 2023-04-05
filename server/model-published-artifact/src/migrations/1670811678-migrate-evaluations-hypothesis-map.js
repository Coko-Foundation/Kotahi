/* eslint-disable no-unused-vars */
const { useTransaction, logger } = require('@coko/server')

const {
  getSubmissionForm,
  getReviewForm,
  getDecisionForm,
  // eslint-disable-next-line import/no-unresolved
} = require('../server/model-review/src/reviewCommsUtils')

// Paths are relative to the generated migrations folder
/* eslint-disable-next-line import/no-unresolved */
const Manuscript = require('../server/model-manuscript/src/manuscript')
/* eslint-disable-next-line import/no-unresolved */
const PublishedArtifact = require('../server/model-published-artifact/src/publishedArtifact')

const fieldKeyRegex = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}).([a-zA-Z]\w*|submission\.[a-zA-Z]\w*|meta.title|meta.abstract)(?::([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}))?$/

const getFieldTitle = (
  fieldId,
  manuscript,
  submissionForm,
  reviewForm,
  decisionForm,
) => {
  const regexResult = fieldKeyRegex.exec(fieldId)
  if (regexResult === null) return 'Unknown field'
  const objectId = regexResult[1]
  const fieldName = regexResult[2]
  const messageId = regexResult.length > 3 ? regexResult[3] : null
  let form = submissionForm

  if (objectId !== manuscript.id) {
    const review = manuscript.reviews.find(r => r.id === objectId)
    if (!review) return fieldName
    form = review.isDecision ? decisionForm : reviewForm
  }

  const field = form.structure.children.find(f => f.name === fieldName)
  if (!field) return fieldName
  return field.title
}

exports.up = async knex => {
  const manuscripts = await Manuscript.query()
    .withGraphFetched('reviews')
    .whereNotNull('evaluationsHypothesisMap')

  logger.info(`Total Manuscripts having hypothesis maps: ${manuscripts.length}`)

  if (manuscripts.length > 0) {
    const submissionForm = await getSubmissionForm()
    const reviewForm = await getReviewForm()
    const decisionForm = await getDecisionForm()

    let totalArtifactsCount = 0

    await useTransaction(async trx => {
      for (let i = 0; i < manuscripts.length; i += 1) {
        const manuscript = manuscripts[i]

        const artifacts = Object.entries(
          manuscript.evaluationsHypothesisMap,
        ).map(([key, value]) => ({
          manuscriptId: manuscript.id,
          platform: 'Hypothesis',
          externalId: value,
          content: `{{${key}}}`,
          title: getFieldTitle(
            key,
            manuscript,
            submissionForm,
            reviewForm,
            decisionForm,
          ),
          hostedInKotahi: true,
          relatedDocumentUri:
            manuscript.submission.link ||
            manuscript.submission.articleURL ||
            manuscript.submission.biorxivURL ||
            manuscript.submission.doi ||
            manuscript.submission.DOI,
          relatedDocumentType: 'preprint',
        }))

        totalArtifactsCount += artifacts.length

        // Updating one-by-one rather than all in parallel, to avoid exhausting available connections
        // eslint-disable-next-line no-await-in-loop
        await PublishedArtifact.query(trx).insert(artifacts)
      }
    })

    logger.info(
      `Finished populating ${totalArtifactsCount} published_artifacts for ${manuscripts.length} manuscripts.`,
    )
  }
}
