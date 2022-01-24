/* eslint-disable camelcase, consistent-return */
const axios = require('axios')

const models = require('@pubsweet/models')
const ArticleImportHistory = require('../model-article-import-history/src/articleImportHistory')
const { formatAsIso8601Date } = require('../utils/dateUtils')

const {
  getServerId,
  getLastImportDate,
  getDate2WeeksAgo,
  getEmptySubmission,
} = require('./importTools')

const CURSOR_LIMIT = 200 // This permits up to 10,000 matches, but prevents infinite loop
const SAVE_CHUNK_SIZE = 50

/** Generate multiple queries to retrieve all manuscripts containing one of the searchStrings
 *  within the given date range.
 *  Multi-word phrases can't be mixed with other phrases in an OR search; to get around this
 *  we generate a separate query for each multi-word phrase.
 *  The queries generated do not include the cursor parameter, which should be added.
 */
const formatSearchQueriesWithoutCursor = (searchStrings, dateFrom, dateTo) => {
  const server = 'all' // One of 'biorxiv', 'medrxiv', 'all'
  const queries = []
  const singleWordTerms = []
  searchStrings.forEach(rawTerm => {
    const term = rawTerm.replace(/[^\w \-.]/g, '')

    if (term.includes(' ')) {
      queries.push(
        `https://api.biorxiv.org/fulltext?server=${server}&terms=${term.replace(
          /\s+/g,
          '+',
        )}&flag=phrase&date_from=${dateFrom}&date_to=${dateTo}`,
      )
    } else {
      singleWordTerms.push(term)
    }
  })

  if (singleWordTerms.length)
    queries.push(
      `https://api.biorxiv.org/fulltext?server=${server}&terms=${singleWordTerms.join(
        '+',
      )}&flag=any&date_from=${dateFrom}&date_to=${dateTo}`,
    )

  return queries
}

const getData = async (ctx, searchStrings) => {
  const sourceId = await getServerId('biorxiv')
  const lastImportDate = await getLastImportDate(sourceId)
  const minDate = Math.max(lastImportDate, await getDate2WeeksAgo())

  const allImports = []
  const dateFrom = formatAsIso8601Date(minDate)
  const dateTo = formatAsIso8601Date(Date.now())

  const queries = formatSearchQueriesWithoutCursor(
    searchStrings,
    dateFrom,
    dateTo,
  )

  // eslint-disable-next-line no-restricted-syntax
  for (const queryWithoutCursor of queries) {
    const queryImports = []

    for (let cursor = 0; cursor < CURSOR_LIMIT; cursor += 1) {
      const queryString = `${queryWithoutCursor}&cursor=${cursor}`
      // eslint-disable-next-line no-await-in-loop
      const { data } = await axios.get(queryString)
      if (!data || !data.collection || !data.collection.length) break
      Array.prototype.push.apply(queryImports, data.collection)
      if (queryImports.length >= data.total_results) break
    }

    // Avoid double-adding a manuscript found by a previous query
    Array.prototype.push.apply(
      allImports,
      queryImports.filter(
        x => !allImports.some(y => x.doi === y.doi && x.version === y.version),
      ),
    )
  }

  // Adjust imports by generating url field and improving abstract formatting
  const modifiedItems = allImports.map(item => ({
    ...item,
    url: `https://${item.server.toLowerCase()}.org/content/${item.doi}v${
      item.version
    }`,
    abstract: item.abstract
      ? `<p>${item.abstract.replace(/\n\s*/g, '</p>\n<p>')}</p>`
      : null,
  }))

  // TODO retrieving all manuscripts to check URLs is inefficient!
  const manuscripts = await models.Manuscript.query()
  const currentURLs = manuscripts.map(({ submission }) => submission.articleURL)

  const withoutDuplicates = modifiedItems.filter(
    ({ url }) => !currentURLs.includes(url),
  )

  const emptySubmission = getEmptySubmission()

  const newManuscripts = withoutDuplicates.map(
    ({
      doi,
      title,
      author: authors,
      author_corresponding,
      author_corresponding_institution,
      abstract,
      date: datePublished,
      server: serverName,
      url,
    }) => ({
      status: 'new',
      isImported: true,
      importSource: sourceId,
      importSourceServer: serverName.toLowerCase(),
      submission: {
        ...emptySubmission,
        firstAuthor: author_corresponding,
        authors: authors
          .map(({ family, given, collab }, index) => ({
            firstName: given,
            lastName: family,
            affiliation:
              index === 0 ? author_corresponding_institution : undefined,
          }))
          .filter(x => x.firstName || x.lastName),
        abstract,
        datePublished: datePublished ? datePublished.replace(/-/g, '/') : null,
        journal: serverName,

        link: url,
        doi: `https://doi.org/${doi}`,
      },
      meta: {
        title,
        notes: [
          {
            notesType: 'fundingAcknowledgement',
            content: '',
          },
          {
            notesType: 'specialInstructions',
            content: '',
          },
        ],
      },
      submitterId: ctx.user,
      channels: [
        {
          topic: 'Manuscript discussion',
          type: 'all',
        },
        {
          topic: 'Editorial discussion',
          type: 'editorial',
        },
      ],
      files: [],
      reviews: [],
      teams: [],
    }),
  )

  if (!newManuscripts.length) return []

  try {
    const result = []

    for (let i = 0; i < newManuscripts.length; i += SAVE_CHUNK_SIZE) {
      const chunk = newManuscripts.slice(i, i + SAVE_CHUNK_SIZE)

      // eslint-disable-next-line no-await-in-loop
      const inserted = await models.Manuscript.query().upsertGraphAndFetch(
        chunk,
        { relate: true },
      )

      Array.prototype.push.apply(result, inserted)
    }

    if (lastImportDate > 0) {
      await ArticleImportHistory.query()
        .update({
          date: new Date().toISOString(),
        })
        .where({ sourceId })
    } else {
      await ArticleImportHistory.query().insert({
        date: new Date().toISOString(),
        sourceId,
      })
    }

    return result
  } catch (e) {
    console.error(e.message)
  }
}

module.exports = getData
