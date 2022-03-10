/* eslint-disable no-restricted-syntax, no-await-in-loop */
const TurndownService = require('turndown')
const axios = require('axios')
const config = require('config')
const { get } = require('lodash')

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
          return `• ${turndownService.turndown(childNode.innerHTML)}\n\n`
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
          return `${index + 1}) ${turndownService.turndown(
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

  const fields = await Promise.all(
    getFieldNamesAndTags(config.hypothesis.publishFields).map(async x => {
      let value

      if (x.fieldName.startsWith('review#')) {
        const index = parseInt(x.fieldName.split('#')[1], 10)

        const reviews = manuscript.reviews.filter(
          r => !r.isDecision && r.canBePublishedPublicly && r.reviewComment,
        )

        value =
          reviews.length > index ? reviews[index].reviewComment.content : null
      } else if (x.fieldName === 'decision') {
        const decisions = manuscript.reviews.filter(
          r => r.isDecision && r.decisionComment,
        )

        value =
          decisions.length > 0 ? decisions[0].decisionComment.content : null
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
