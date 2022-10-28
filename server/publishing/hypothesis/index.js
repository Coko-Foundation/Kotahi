/* eslint-disable no-restricted-syntax, no-await-in-loop */
const TurndownService = require('turndown')
const axios = require('axios')
const config = require('config')
const { getUsersById } = require('../../model-user/src/userCommsUtils')
const { getActiveForms } = require('../../model-form/src/formCommsUtils')
const { getPublishableFields, normalizeUri } = require('./hypothesisTools')

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
  const uri = manuscript.submission.biorxivURL || manuscript.submission.link

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
  const datedFields = fields.filter(f => f.date).sort((a, b) => a.date - b.date)
  const fieldsWithoutDates = fields.filter(f => !f.date)
  const orderedFields = datedFields.concat(fieldsWithoutDates)

  const newHypothesisMap = {}

  for (const f of orderedFields) {
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
        newHypothesisMap[f.annotationName] = response.data.id
      } else if (f.action === 'update') {
        await axios.patch(
          `${REQUEST_URL}/${f.annotationId}`,
          requestBody,
          headers,
        )
        newHypothesisMap[f.annotationName] = f.annotationId
      }
    } else if (f.action === 'delete') {
      await deletePublication(f.annotationId)
    }
  }

  return newHypothesisMap
}

module.exports = {
  publishToHypothesis,
  deletePublication,
}
