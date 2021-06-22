/* eslint-disable no-restricted-syntax, no-await-in-loop */
const TurndownService = require('turndown')
const axios = require('axios')
const checkIsAbstractValueEmpty = require('../../utils/checkIsAbstractValueEmpty')

const headers = {
  headers: {
    Authorization: `Bearer ${process.env.HYPOTHESIS_API_KEY}`,
  },
}

const requestURL = `https://api.hypothes.is/api/annotations`

const deletePublication = publicationId => {
  return axios.delete(
    `https://api.hypothes.is/api/annotations/${publicationId}`,
    { ...headers, data: {} },
  )
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

  const fields = Object.entries(manuscript.submission)
    .filter(
      ([prop, value]) =>
        !Number.isNaN(Number(prop.split('review')[1])) &&
        prop.includes('review'),
    )
    .map(([prop]) => Number(prop.split('review')[1]))
    .sort((a, b) => b - a)
    .map(number => `review${number}`)

  fields.push('summary')

  const definedActions = fields.map(async propName => {
    const value = manuscript.submission[propName]
    let action = ''

    if (
      manuscript.evaluationsHypothesisMap[propName] &&
      checkIsAbstractValueEmpty(value)
    ) {
      action = 'delete'
    }

    if (
      !checkIsAbstractValueEmpty(value) &&
      !manuscript.evaluationsHypothesisMap[propName]
    ) {
      action = 'create'
    }

    if (
      manuscript.evaluationsHypothesisMap[propName] &&
      !checkIsAbstractValueEmpty(value)
    ) {
      const annotationIdFromHypothesis =
        manuscript.evaluationsHypothesisMap[propName]

      action = 'update'

      try {
        await axios.get(`${requestURL}/${annotationIdFromHypothesis}`, {
          headers,
        })
      } catch (e) {
        action = 'create'
      }
    }

    return new Promise(resolve => {
      resolve({
        propName,
        value,
        action,
      })
    })
  })

  const fieldsWithActionsPrepared = await Promise.all(definedActions)

  const fieldsWithAction = fieldsWithActionsPrepared.filter(
    field => field.action,
  )

  const actions = {
    create: propName => {
      const requestBody = {
        uri: manuscript.submission.biorxivURL,
        text: turndownService.turndown(manuscript.submission[propName]),
        tags: [propName === 'summary' ? 'evaluationSummary' : 'peerReview'],
      }

      if (process.env.NODE_ENV === 'production') {
        requestBody.permissions = {
          read: ['group:q5X6RWJ6'],
        }
        requestBody.group = 'q5X6RWJ6'
      }

      return () => {
        return axios.post(requestURL, requestBody, headers).then(response => ({
          [propName]: response.data.id,
        }))
      }
    },
    update: propName => {
      const requestBody = {
        uri: manuscript.submission.biorxivURL,
        text: turndownService.turndown(manuscript.submission[propName]),
        tags: [propName === 'summary' ? 'evaluationSummary' : 'peerReview'],
      }

      if (process.env.NODE_ENV === 'production') {
        requestBody.permissions = {
          read: ['group:q5X6RWJ6'],
        }
        requestBody.group = 'q5X6RWJ6'
      }

      return () => {
        const publicationId = manuscript.evaluationsHypothesisMap[propName]

        return axios
          .patch(`${requestURL}/${publicationId}`, requestBody, headers)
          .then(() => ({
            [propName]: publicationId,
          }))
      }
    },
    delete: propName => {
      const publicationId = manuscript.evaluationsHypothesisMap[propName]

      return () => {
        return deletePublication(publicationId).then(() => ({}))
      }
    },
  }

  const actionPromises = fieldsWithAction.map(field => {
    return actions[field.action](field.propName)
  })

  const results = []

  for (const request of actionPromises) {
    const result = await request()
    results.push(result)
  }

  const newHypothesisEvaluationMap = results.reduce((acc, curr) => {
    return {
      ...acc,
      ...curr,
    }
  }, {})

  return newHypothesisEvaluationMap
}

module.exports = {
  publishToHypothesis,
  deletePublication,
}
