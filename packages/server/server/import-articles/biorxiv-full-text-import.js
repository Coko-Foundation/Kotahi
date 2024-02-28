/* eslint-disable camelcase, consistent-return */
const axios = require('axios')
const models = require('@pubsweet/models')
const { dateToIso8601 } = require('../utils/dateUtils')

const {
  getServerId,
  getLastImportDate,
  getDate2WeeksAgo,
  getEmptySubmission,
  rawAbstractToSafeHtml,
} = require('./importTools')

const CURSOR_LIMIT = 200 // This permits up to 10,000 matches, but prevents infinite loop
const SAVE_CHUNK_SIZE = 50

/** Generate a query to retrieve all manuscripts from biorxiv within the given date range.
 *  The generated query does not include the cursor parameter, which should be added.
 */
const formatSearchQueryWithoutCursor = (dateFrom, dateTo) => {
  const server = 'biorxiv'
  const importUrl = `https://api.biorxiv.org/fulltext?server=${server}&terms=""`
  return `${importUrl}&flag=any&date_from=${dateFrom}&date_to=${dateTo}`
}

const getData = async (groupId, ctx) => {
  const sourceId = await getServerId('biorxiv')
  const lastImportDate = await getLastImportDate(sourceId, groupId)
  const minDate = Math.max(lastImportDate, await getDate2WeeksAgo())
  const dateFrom = dateToIso8601(minDate)
  const dateTo = dateToIso8601(Date.now())

  const queryWithoutCursor = formatSearchQueryWithoutCursor(dateFrom, dateTo)

  const imports = []

  for (let cursor = 0; cursor < CURSOR_LIMIT; cursor += 1) {
    const queryString = `${queryWithoutCursor}&cursor=${cursor}`
    // eslint-disable-next-line no-await-in-loop
    const { data } = await axios.get(queryString)
    if (!data || !data.collection || !data.collection.length) break
    Array.prototype.push.apply(imports, data.collection)
    if (imports.length >= data.total_results) break
  }

  // Adjust imports by generating url field and improving abstract formatting
  const modifiedItems = imports.map(item => ({
    ...item,
    url: `https://${item.server.toLowerCase()}.org/content/${item.doi}v${
      item.version
    }`,
    abstract: rawAbstractToSafeHtml(item.abstract),
  }))

  const filteredDataset = new Set()

  const withoutBiorxivDuplicates = modifiedItems.filter(preprint => {
    const isDuplicate = filteredDataset.has(preprint.url)
    if (isDuplicate) return false

    filteredDataset.add(preprint.url)
    return true
  })

  // TODO retrieving all manuscripts to check URLs is inefficient!
  const manuscripts = await models.Manuscript.query().where({ groupId })
  const currentURLs = new Set(manuscripts.map(m => m.submission.$sourceUri))

  const withoutDuplicates = withoutBiorxivDuplicates.filter(
    ({ url }) => !currentURLs.has(url),
  )

  const allowedSubjectMatterAreas = ['biophysics', 'biochemistry']

  const importsWithDesiredCategoryOnly = withoutDuplicates.filter(preprint =>
    allowedSubjectMatterAreas.includes(preprint.category),
  )

  const emptySubmission = getEmptySubmission(groupId)

  const newManuscripts = importsWithDesiredCategoryOnly.map(
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
        $title: title,
        firstAuthor: author_corresponding,
        $authors: authors
          .map(({ family, given, collab }, index) => ({
            firstName: given,
            lastName: family,
            affiliation:
              index === 0 ? author_corresponding_institution : undefined,
          }))
          .filter(x => x.firstName || x.lastName),
        $abstract: abstract,
        datePublished: datePublished ? datePublished.replace(/-/g, '/') : null,
        journal: serverName,

        $sourceUri: url,
        $doi: doi,
      },
      meta: {},
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
      groupId,
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
      await models.ArticleImportHistory.query()
        .update({
          date: new Date().toISOString(),
        })
        .where({ sourceId, groupId })
    } else {
      await models.ArticleImportHistory.query().insert({
        date: new Date().toISOString(),
        sourceId,
        groupId,
      })
    }

    return result
  } catch (e) {
    console.error(e.message)
  }
}

module.exports = getData
