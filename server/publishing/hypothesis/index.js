/* eslint-disable no-restricted-syntax, no-await-in-loop */
const TurndownService = require('turndown')
const axios = require('axios')
const config = require('config')
const { get } = require('lodash')
const { getPublicFields } = require('../../model-form/src/formCommsUtils')
const { ensureJsonIsParsed } = require('../../utils/objectUtils')

const {
  getFieldNamesAndTags,
  hasText,
  normalizeUri,
} = require('./hypothesisTools')

const headers = {
  headers: {
    Authorization: `Bearer ${process.env.HYPOTHESIS_API_KEY}`,
  },
}

const REQUEST_URL = `https://api.hypothes.is/api/annotations`

// We could support publishing other field types, but these were the easiest and only ones needed for now.
const isPublishableFieldType = ({ component }) =>
  ['TextField', 'AbstractEditor'].includes(component)

/** For an identifier such as 'review#0', return the corresponding review (with parsed jsonData),
 * or return { jsonData: {} } if not found or the review is hidden.
 */
const getReview = (manuscript, reviewIdentifier) => {
  const index = parseInt(reviewIdentifier.split('#')[1], 10)
  const reviews = manuscript.reviews.filter(r => !r.isDecision)

  const review =
    index < reviews.length ? { ...reviews[index] } : { jsonData: {} }

  if (review.isHiddenFromAuthor) return { jsonData: {} }
  review.jsonData = ensureJsonIsParsed(review.jsonData)
  return review
}

/** Returns the decision or { jsonData: {} } if not found */
const getDecision = manuscript => {
  const decisions = manuscript.reviews.filter(r => r.isDecision)
  const decision = decisions.length ? { ...decisions[0] } : { jsonData: {} }
  if (typeof decision.jsonData === 'string')
    decision.jsonData = JSON.parse(decision.jsonData)
  return decision
}

/** Returns a single piece of html containing all nominated fields (that are not empty).
 * If multiple fields are nominated, then a heading will precede the content of each field,
 * but if only one is nominated, the heading is omitted. */
const composeHtmlFromPublishableFields = (review, publishableFields) => {
  const fieldsToPublish = publishableFields
    .filter(f => review.jsonData[f.name])
    .map(f => ({
      title: f.title,
      value: review.jsonData[f.name],
      component: f.component,
    }))

  if (fieldsToPublish.length)
    return fieldsToPublish
      .map(
        f =>
          `${publishableFields.length > 1 ? `<h5>${f.title}</h5>` : ''}${
            f.component === 'AbstractEditor' ? f.value : `<p>${f.value}</p>`
          }`,
      )
      .join('\n')

  return null
}

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

const publishToHypothesis = async manuscript => {
  const turndownService = new TurndownService({ bulletListMarker: '-' })
  turndownService.addRule('unorderedLists', {
    filter: ['ul'],
    replacement(content, node) {
      const unorderedListResult = [...node.childNodes]
        .map((childNode, index) => {
          return ` - ${turndownService.turndown(childNode.innerHTML)}\n\n`
        })
        .join('')

      return unorderedListResult
    },
  })

  turndownService.addRule('orderedLists', {
    filter: ['ol'],
    replacement(content, node) {
      const orderedListResult = [...node.childNodes]
        .map((childNode, index) => {
          return `${index + 1}. ${turndownService.turndown(
            childNode.innerHTML,
          )}\n\n`
        })
        .join('')

      return orderedListResult
    },
  })

  const uri = manuscript.submission.biorxivURL || manuscript.submission.link

  const title =
    manuscript.meta.title ||
    manuscript.submission.title ||
    manuscript.submission.description

  const publishableReviewFields = (
    await getPublicFields('review', 'review')
  ).filter(isPublishableFieldType)

  const publishableDecisionFields = (
    await getPublicFields('decision', 'decision')
  ).filter(isPublishableFieldType)

  const fields = await Promise.all(
    getFieldNamesAndTags(config.hypothesis.publishFields).map(async x => {
      let value = null

      if (x.fieldName.startsWith('review#')) {
        const review = getReview(manuscript, x.fieldName)
        value = composeHtmlFromPublishableFields(
          review,
          publishableReviewFields,
        )
      } else if (x.fieldName === 'decision') {
        const decision = getDecision(manuscript)
        value = composeHtmlFromPublishableFields(
          decision,
          publishableDecisionFields,
        )
      } else {
        value = get(manuscript, x.fieldName)
      }

      const annotationId = manuscript.evaluationsHypothesisMap[x.fieldName]
      const hasPreviousValue = !!annotationId
      let action
      if (hasText(value)) action = hasPreviousValue ? 'update' : 'create'
      else action = hasPreviousValue ? 'delete' : null

      if (['update', 'delete'].includes(action)) {
        // Check with Hypothesis that there truly is an annotation to update or delete
        try {
          await axios.get(`${REQUEST_URL}/${annotationId}`, {
            ...headers,
          })
        } catch (e) {
          action = action === 'update' ? 'create' : null
        }
      }

      if (['create', 'update'].includes(action) && !uri)
        throw new Error(
          'Missing field submission.biorxivURL or submission.link',
        )

      return { action, fieldName: x.fieldName, value, tag: x.tag, annotationId }
    }),
  )

  const newHypothesisMap = {}

  for (const f of fields) {
    if (['create', 'update'].includes(f.action)) {
      const requestBody = {
        group: config.hypothesis.group,
        permissions: { read: [`group:${config.hypothesis.group}`] },
        uri: normalizeUri(uri),
        document: { title: [title] },
        text: turndownService.turndown(f.value),
        tags: f.tag ? [f.tag] : [],
      }

      if (f.action === 'create') {
        const response = await axios.post(REQUEST_URL, requestBody, headers)
        newHypothesisMap[f.fieldName] = response.data.id
      } else if (f.action === 'update') {
        await axios.patch(
          `${REQUEST_URL}/${f.annotationId}`,
          requestBody,
          headers,
        )
        newHypothesisMap[f.fieldName] = f.annotationId
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
