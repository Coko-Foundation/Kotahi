const TurndownService = require('turndown')
const axios = require('axios')
const checkIsAbstractValueEmpty = require('../../utils/checkIsAbstractValueEmpty')

const headers = {
  headers: {
    Authorization: `Bearer ${process.env.HYPOTHESIS_API_KEY}`,
  },
}

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

  const shouldCreateReviews = Object.entries(manuscript.submission)
    .filter(
      ([prop, value]) =>
        !Number.isNaN(Number(prop.split('review')[1])) &&
        prop.includes('review') &&
        !checkIsAbstractValueEmpty(value) &&
        !manuscript.evaluationsHypothesisMap[prop],
    )
    .map(([propName]) => propName)
    .filter(propName => {
      const reviewNumber = propName.split('review')[1]

      return manuscript.submission[`review${reviewNumber}date`]
    })

  const shouldDeleteReviews = Object.entries(manuscript.submission)
    .filter(
      ([prop, value]) =>
        !Number.isNaN(Number(prop.split('review')[1])) &&
        prop.includes('review') &&
        manuscript.evaluationsHypothesisMap[prop] &&
        checkIsAbstractValueEmpty(value),
    )
    .map(([propName]) => propName)

  const shouldUpdateReviews = Object.entries(manuscript.submission)
    .filter(
      ([prop, value]) =>
        !Number.isNaN(Number(prop.split('review')[1])) &&
        prop.includes('review') &&
        manuscript.evaluationsHypothesisMap[prop] &&
        !checkIsAbstractValueEmpty(value),
    )
    .map(([propName]) => propName)
    .filter(propName => {
      const reviewNumber = propName.split('review')[1]

      return manuscript.submission[`review${reviewNumber}date`]
    })

  if (
    !manuscript.evaluationsHypothesisMap.summary &&
    !checkIsAbstractValueEmpty(manuscript.submission.summary)
  ) {
    // Create summary
    shouldCreateReviews.push('summary')
  }

  if (
    manuscript.evaluationsHypothesisMap.summary &&
    checkIsAbstractValueEmpty(manuscript.submission.summary)
  ) {
    // Delete summary
    shouldDeleteReviews.push('summary')
  }

  if (
    manuscript.evaluationsHypothesisMap.summary &&
    !checkIsAbstractValueEmpty(manuscript.submission.summary)
  ) {
    // Update summary
    shouldUpdateReviews.push('summary')
  }

  const requestURL = `https://api.hypothes.is/api/annotations`

  const createPromises = shouldCreateReviews.map(propName => {
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

    return axios.post(requestURL, requestBody, headers).then(response => ({
      [propName]: response.data.id,
    }))
  })

  const deletePromises = shouldDeleteReviews.map(propName => {
    const publicationId = manuscript.evaluationsHypothesisMap[propName]
    return deletePublication(publicationId).then(res => {
      return {
        [propName]: '',
      }
    })
  })

  const updatePromises = shouldUpdateReviews.map(propName => {
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

    const publicationId = manuscript.evaluationsHypothesisMap[propName]
    return axios
      .patch(`${requestURL}/${publicationId}`, requestBody, headers)
      .then(() => ({
        [propName]: publicationId,
      }))
  })

  const createResults = await Promise.all(createPromises)
  const deleteResults = await Promise.all(deletePromises)
  const updateResults = await Promise.all(updatePromises)

  const newHypothesisEvaluationMap = [
    ...createResults,
    ...deleteResults,
    ...updateResults,
  ].reduce((acc, curr) => {
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
