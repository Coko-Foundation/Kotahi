/* eslint-disable no-restricted-syntax, no-await-in-loop */
const TurndownService = require('turndown')
const axios = require('axios')
const config = require('config')
const models = require('@pubsweet/models')
const { getUsersById } = require('../../model-user/src/userCommsUtils')
const { getActiveForms } = require('../../model-form/src/formCommsUtils')
const { getPublishableFields, normalizeUri } = require('./hypothesisTools')
const { upsertArtifact, deleteArtifact } = require('../publishingCommsUtils')

const {
  getThreadedDiscussionsForManuscript,
} = require('../../model-threaded-discussion/src/threadedDiscussionCommsUtils')

const headers = {
  headers: {
    Authorization: `Bearer ${process.env.HYPOTHESIS_API_KEY}`,
  },
}

const REQUEST_URL = `https://api.hypothes.is/api/annotations`

/** DELETE a publication from Hypothesis via REST */
const deletePublication = async publicationId => {
  try {
    const response = await axios.delete(`${REQUEST_URL}/${publicationId}`, {
      ...headers,
      data: {},
    })

    return response
  } catch (e) {
    return null
  }
}

/** Check with hypothes.is that this annotation already exists; return true or false. */
const annotationActuallyExists = async data => {
  try {
    await axios.get(`${REQUEST_URL}/${data.annotationId}`, {
      ...headers,
    })
    return true
  } catch (e) {
    return false
  }
}

const prepareTurndownService = () =>
  new TurndownService({ bulletListMarker: '*' })

const publishToHypothesis = async manuscript => {
  const turndownService = prepareTurndownService()

  const uri =
    manuscript.submission.biorxivURL ||
    manuscript.submission.link ||
    manuscript.submission.url ||
    manuscript.submission.uri

  const title =
    manuscript.meta.title ||
    manuscript.submission.title ||
    manuscript.submission.description

  const publishableFieldData = getPublishableFields(
    manuscript,
    await getActiveForms(),
    await getThreadedDiscussionsForManuscript(manuscript, getUsersById),
  )

  const fields = await Promise.all(
    publishableFieldData.map(async d => {
      if (['create', 'update'].includes(d.action) && !uri)
        throw new Error(
          'Missing field submission.biorxivURL or submission.link',
        )

      if (d.action === 'update' && !(await annotationActuallyExists(d)))
        return { ...d, action: 'create' }
      if (d.action === 'delete' && !(await annotationActuallyExists(d)))
        return { ...d, action: null }

      if (d.action === null && !uri)
        throw new Error(
          'Missing field submission.biorxivURL or submission.link',
        )

      return d
    }),
  )

  if (config.hypothesis.reverseFieldOrder === 'true') fields.reverse()
  // Some fields have dates (e.g. review fields; ThreadedDiscussion comments) and should be published in date order.
  const datedFields = fields.filter(f => f.date).sort((a, b) => a.date - b.date)
  const fieldsWithoutDates = fields.filter(f => !f.date)
  const orderedFields = datedFields.concat(fieldsWithoutDates)

  for (const f of orderedFields) {
    const artifact = {
      title: `${f.publishingTag || f.fieldTitle}: ${title}`,
      // Using a template for content means it's an invariant identifier.
      // We can use this field to find if this has previously been
      // published to Hypothesis, and what the Hypothesis ID is.
      content: `{{${f.objectId}.${f.fieldName}}}`,
      manuscriptId: manuscript.id,
      platform: 'Hypothesis',
      externalId: f.annotationId,
      hostedInKotahi: true,
      relatedDocumentUri: normalizeUri(uri),
      relatedDocumentType: 'preprint',
    }

    if (['create', 'update'].includes(f.action)) {
      const requestBody = {
        group: config.hypothesis.group,
        permissions: { read: [`group:${config.hypothesis.group}`] },
        uri: normalizeUri(uri),
        document: { title: [title] },
        text: turndownService.turndown(f.text),
        tags: f.publishingTag ? [f.publishingTag] : [],
      }

      if (f.action === 'create') {
        const response = await axios.post(REQUEST_URL, requestBody, headers)
        await upsertArtifact({ ...artifact, externalId: response.data.id })
      } else if (f.action === 'update') {
        await axios.patch(
          `${REQUEST_URL}/${f.annotationId}`,
          requestBody,
          headers,
        )
        await upsertArtifact(artifact)
      }
    } else if (f.action === 'delete') {
      await deletePublication(f.annotationId)
      await deleteArtifact(manuscript.id, f.annotationId)
    }
  }
}

const publishSpecificAnnotationToHypothesis = async (
  content,
  contentTemplate,
  tag,
  uri,
  manuscriptTitle,
  manuscriptId,
) => {
  const turndownService = prepareTurndownService()

  const existingArtifact = await models.PublishedArtifact.query().findOne({
    manuscriptId,
    content: contentTemplate,
  })

  let externalId = existingArtifact ? existingArtifact.externalId : null

  const artifact = {
    title: `${tag}: ${manuscriptTitle}`,
    // Using a template for content means it's an invariant identifier.
    // We can use this field to find if this has previously been
    // published to Hypothesis, and what the Hypothesis ID is.
    content: contentTemplate,
    manuscriptId,
    platform: 'Hypothesis',
    externalId,
    hostedInKotahi: true,
    relatedDocumentUri: normalizeUri(uri),
    relatedDocumentType: 'preprint',
  }

  const requestBody = {
    group: config.hypothesis.group,
    permissions: { read: [`group:${config.hypothesis.group}`] },
    uri: normalizeUri(uri),
    document: { title: [manuscriptTitle] },
    text: turndownService.turndown(content),
    tags: tag ? [tag] : [],
  }

  let artifactId

  if (existingArtifact) {
    await axios.patch(`${REQUEST_URL}/${externalId}`, requestBody, headers)
    artifactId = await upsertArtifact(artifact)
  } else {
    const response = await axios.post(REQUEST_URL, requestBody, headers)
    externalId = response.data.id
    artifactId = await upsertArtifact({ ...artifact, externalId })
  }

  return { artifactId, externalId }
}

module.exports = {
  publishToHypothesis,
  publishSpecificAnnotationToHypothesis,
  deletePublication,
}
