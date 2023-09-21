const axios = require('axios')
const { formatCitation } = require('./formatting')
// const { logger } = require('@coko/server') // turning off logger until I can get it to work in tests

axios.interceptors.request.use(req => {
  // logger.debug('Starting Request:', JSON.stringify(req, null, 2))
  return req
})

axios.interceptors.response.use(resp => {
  // logger.debug('Response:', JSON.stringify(resp.data, null, 2))
  return resp
})

const pluckAuthors = authors => {
  if (!authors) return authors
  return authors.map(({ given, family, sequence }) => {
    return { given, family, sequence }
  })
}

const pluckTitle = title => title && title[0]
const pluckJournalTitle = journalTitle => journalTitle && journalTitle[0]

const createReference = data => {
  const {
    DOI: doi,
    author,
    page,
    title,
    issue,
    volume,
    'container-title': journalTitle,
  } = data

  return {
    doi,
    author: pluckAuthors(author),
    page,
    issue,
    volume,
    title: pluckTitle(title),
    journalTitle: pluckJournalTitle(journalTitle),
  }
}

const createFormattedReference = async (data, groupId) => {
  const {
    DOI: doi,
    author,
    page,
    title,
    issue,
    volume,
    'container-title': journalTitle,
  } = data

  const outputData = {
    doi,
    DOI: doi,
    author: pluckAuthors(author),
    page,
    issue,
    volume,
    title: pluckTitle(title),
    journalTitle: pluckJournalTitle(journalTitle),
  }

  const formattedCitation = await formatCitation(
    JSON.stringify(outputData),
    groupId,
  )

  outputData.formattedCitation = formattedCitation.result

  return outputData
}

// const refValConfig = config.get('referenceValidator')

// A note: per https://www.crossref.org/documentation/retrieve-metadata/rest-api/tips-for-using-the-crossref-rest-api/, this is the
// "polite" way to use the API (which uses the mailto parameter for self-identification). There is also a "plus" version of the API
// which requires a service contract; the benefit of that is that it will not be rate-limited. We could consider an implementation
// that uses this? Paramter would go in config.

// TODO: Is it worth caching requests/results? It's likely that the same requests are going to be sent out, and caching might help.

const getMatchingReferencesFromCrossRef = async (
  reference,
  count,
  crossrefRetrievalEmail,
) => {
  // console.log('Coming in server-side: ', reference, count)
  // eslint-disable-next-line no-return-await
  return await axios
    .get('https://api.crossref.org/v1/works', {
      params: {
        'query.bibliographic': reference,
        rows: count,
        select: 'DOI,author,issue,page,title,volume,container-title',
        mailto: crossrefRetrievalEmail,
      },
      headers: {
        'User-Agent': `Kotahi (Axios 0.21; mailto:${crossrefRetrievalEmail})`,
      },
    })
    .then(response => {
      return response.data.message.items.reduce(
        (accumulator, current, index) => {
          accumulator.push(createReference(current))
          return accumulator
        },
        [],
      )
    })
}

const getFormattedReferencesFromCrossRef = async (
  reference,
  count,
  crossrefRetrievalEmail,
  groupId,
) => {
  // console.log('Coming in server-side: ', reference, count)
  // Documentation on this API: https://api.crossref.org/swagger-ui/index.html#/Works/get_works
  // eslint-disable-next-line no-return-await
  return await axios
    .get('https://api.crossref.org/v1/works', {
      params: {
        'query.bibliographic': reference,
        rows: count,
        select: 'DOI,author,issue,page,title,volume,container-title',
        mailto: crossrefRetrievalEmail || '',
      },
      headers: {
        'User-Agent': `Kotahi (Axios 0.21; mailto:${
          crossrefRetrievalEmail || ''
        })`,
      },
    })
    .then(response => {
      return response.data.message.items.reduce(
        (accumulator, current, index) => {
          accumulator.push(createFormattedReference(current, groupId))
          return accumulator
        },
        [],
      )
    })
}

const getReferenceWithDoi = async (doi, crossrefRetrievalEmail) => {
  // eslint-disable-next-line no-return-await
  return await axios
    .get(`https://api.crossref.org/v1/works/${doi}`, {
      params: {
        mailto: crossrefRetrievalEmail,
      },
      headers: {
        'User-Agent': `Kotahi (Axios 0.21; mailto:${crossrefRetrievalEmail})`,
      },
    })
    .then(response => {
      return createReference(response.data.message)
    })
}

module.exports = {
  getMatchingReferencesFromCrossRef,
  getFormattedReferencesFromCrossRef,
  getReferenceWithDoi,
}
