/* eslint-disable no-console */

const axios = require('axios')
const models = require('@pubsweet/models')

const {
  getLastImportDate,
  getEmptySubmission,
  rawAbstractToSafeHtml,
} = require('./importTools')

const SAVE_CHUNK_SIZE = 50

const getData = async (groupId, ctx) => {
  const activeConfig = await models.Config.getCached(groupId)

  const [checkIfSourceExists] = await models.ArticleImportSources.query().where(
    {
      server: 'semantic-scholar',
    },
  )

  if (!checkIfSourceExists) {
    await models.ArticleImportSources.query().insert({
      server: 'semantic-scholar',
    })
  }

  const [semanticScholarImportSourceId] =
    await models.ArticleImportSources.query().where({
      server: 'semantic-scholar',
    })

  const sourceId = semanticScholarImportSourceId.id

  const imports = []

  const lastImportDate = await getLastImportDate(sourceId, groupId)

  const manuscripts = await models.Manuscript.query()
    .where({ groupId, isHidden: false })
    .orderBy('created', 'desc')

  const selectedManuscripts = manuscripts.filter(
    manuscript => manuscript.submission.$customStatus,
  )

  const latestLimitedSelectedManuscripts = selectedManuscripts.slice(0, 100)

  console.log(
    `  Querying Semantic Scholar based on ${latestLimitedSelectedManuscripts.length} seed manuscripts...`,
  )

  if (latestLimitedSelectedManuscripts.length > 0) {
    const importDOIParams = latestLimitedSelectedManuscripts.map(manuscript => {
      const DOI = encodeURI(manuscript.submission.$doi)
      return `DOI:${DOI}`
    })

    const importParameters = JSON.stringify({
      positivePaperIds: importDOIParams,
      negativePaperIds: [],
    })

    const semanticSholarRequestUri =
      'https://api.semanticscholar.org/recommendations/v1/papers?limit=500&fields=url,venue,year,externalIds,title,abstract,authors,journal,publicationDate,venue'

    const { data } = await axios.post(
      semanticSholarRequestUri,
      importParameters,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    console.log(
      `  ${data?.recommendedPapers?.length} papers were recommended...`,
    )

    if (data) {
      Array.prototype.push.apply(imports, data.recommendedPapers)
    }

    const importsOnlyWithDOI = imports.filter(
      preprints => preprints.externalIds.DOI,
    )

    console.log(`  ${importsOnlyWithDOI.length} of these have DOIs...`)

    /* The following code is commented, since semantic scholar now provides journal and publication date as well. In case there is any inconsistency in that data, we can reuse the following */
    // await fetchPublicationDatesFromEuropePmc(importsOnlyWithDOI)

    const recencyPeriodDays = Number(
      activeConfig.formData.semanticScholar
        .semanticScholarImportsRecencyPeriodDays ?? 0,
    )

    const recentImports = importsOnlyWithDOI.filter(preprint => {
      if (!recencyPeriodDays) return true

      if (preprint.publicationDate) {
        const currentDate = new Date().toISOString().split('T')[0]

        const diffDays = Math.floor(
          (Date.parse(currentDate.replace(/-/g, '/')) -
            Date.parse(preprint.publicationDate.replace(/-/g, '/'))) /
            (1000 * 60 * 60 * 24),
        )

        return diffDays < recencyPeriodDays
      }

      return false
    })

    console.log(
      `  ${
        recentImports.length
      } of these are within the configured recency period (${
        recencyPeriodDays ? `${recencyPeriodDays} days` : 'no limit'
      })`,
    )

    const allowedPreprintServers =
      activeConfig.formData.semanticScholar.semanticScholarPublishingServers

    const importsFromSpecificPreprintServers = recentImports.filter(
      preprint => {
        const venueLcTokens = preprint.venue.toLowerCase().split(/\s+/)
        return allowedPreprintServers.some(server =>
          venueLcTokens.includes(server.toLowerCase()),
        )
      },
    )

    console.log(
      `  ${importsFromSpecificPreprintServers.length} of these are from the selected servers...`,
    )

    const currentDOIs = new Set(
      manuscripts.map(({ submission }) => submission.$doi),
    )

    const currentURLs = new Set(manuscripts.map(m => m.submission.$sourceUri))

    const withoutDOIDuplicates = importsFromSpecificPreprintServers.filter(
      preprints => !currentDOIs.has(preprints.externalIds.DOI),
    )

    const withoutUrlDuplicates = withoutDOIDuplicates.filter(
      preprints => !currentURLs.has(preprints.url),
    )

    console.log(
      `  ${withoutUrlDuplicates.length} of these are new to this group.`,
    )

    const emptySubmission = getEmptySubmission(groupId)

    const newManuscripts = withoutUrlDuplicates.map(
      ({
        title,
        authors,
        abstract,
        url,
        externalIds,
        publicationDate,
        venue,
      }) => ({
        status: 'new',
        isImported: true,
        importSource: sourceId,
        importSourceServer: 'semantic-scholar',
        submission: {
          ...emptySubmission,
          $title: title,
          firstAuthor: authors[0] ? authors[0].name : '',
          $authors: authors.map(index => ({
            firstName: index.name.split(' ').slice(0, -1).join(' '),
            lastName: index.name.split(' ').slice(-1).join(' '),
          })),
          $abstract: rawAbstractToSafeHtml(abstract),
          datePublished: publicationDate,
          journal: venue,
          $sourceUri: url,
          $doi: externalIds?.DOI || '',
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

      console.log(
        `  Saved ${newManuscripts.length} papers from Semantic Scholar.`,
      )

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

  return []
}

/* The following code is commented, since semantic scholar now provides journal and publication date as well. In case there is any inconsistency in that data, we can reuse the following */

// async function fetchPublicationDatesFromEuropePmc(importsOnlyWithDOI) {
//   await Promise.all(
//     map(importsOnlyWithDOI, async preprint => {
//       const queryDoi = `DOI:${preprint.externalIds.DOI}`

//       const params = {
//         query: queryDoi,
//         format: 'json',
//       }

//       let firstPublicationDate, preprintServer

//       try {
//         const response = await axios.get(
//           `https://www.ebi.ac.uk/europepmc/webservices/rest/search`,
//           {
//             params,
//           },
//         )

//         if (
//           response.data.resultList &&
//           response.data.resultList.result[0] &&
//           response.data.resultList.result[0].bookOrReportDetails
//         ) {
//           firstPublicationDate =
//             response.data.resultList.result[0].firstPublicationDate
//           preprintServer =
//             response.data.resultList.result[0].bookOrReportDetails.publisher
//         }

//         return Object.assign(preprint, { firstPublicationDate, preprintServer })
//       } catch (e) {
//         console.error(e.message)
//       }
//     }),
//   )
// }

module.exports = getData
