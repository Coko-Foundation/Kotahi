/* eslint-disable no-restricted-syntax, no-await-in-loop */
const TurndownService = require('turndown')
const axios = require('axios')
const config = require('config')
const { get } = require('lodash')

const headers = {
  headers: {
    Authorization: `Bearer ${process.env.HYPOTHESIS_API_KEY}`,
  },
}

const requestURL = `https://api.hypothes.is/api/annotations`

/** DELETE a publication from Hypothesis via REST */
const deletePublication = async publicationId => {
  try {
    const response = await axios.delete(`${requestURL}/${publicationId}`, {
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

  const fields = await Promise.all(
    config.hypothesis.publishFields.split(',').map(async f => {
      const parts = f.split(':')
      const fieldName = parts[0].trim()
      const tag = parts[1] ? parts[1].trim() : null
      let value = get(manuscript, fieldName)
      if (
        value === '<p></p>' ||
        value === '<p class="paragraph"></p>' ||
        typeof value !== 'string'
      )
        value = null

      const hasPreviousValue = !!manuscript.evaluationsHypothesisMap[fieldName]
      let action
      if (value) action = hasPreviousValue ? 'update' : 'create'
      else action = hasPreviousValue ? 'delete' : null
      let annotationId

      if (['update', 'delete'].includes(action)) {
        annotationId = manuscript.evaluationsHypothesisMap[fieldName]

        // Check with Hypothesis that there truly is an annotation to update or delete
        try {
          await axios.get(`${requestURL}/${annotationId}`, {
            headers,
          })
        } catch (e) {
          action = action === 'update' ? 'create' : null
        }
      }

      if (['create', 'update'].includes(action) && !uri)
        throw new Error(
          'Missing field submission.biorxivURL or submission.link',
        )

      return { action, fieldName, value, tag, annotationId }
    }),
  )

  const newHypothesisMap = {}

  for (const f of fields) {
    if (['create', 'update'].includes(f.action)) {
      const requestBody = {
        group: config.hypothesis.group,
        permissions: { read: [`group:${config.hypothesis.group}`] },
        uri,
        text: turndownService.turndown(f.value),
        tags: f.tag ? [f.tag] : [],
      }

      if (f.action === 'create') {
        const response = await axios.post(requestURL, requestBody, headers)
        newHypothesisMap[f.fieldName] = response.data.id
      } else if (f.action === 'update') {
        await axios.patch(
          `${requestURL}/${f.annotationId}`,
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
