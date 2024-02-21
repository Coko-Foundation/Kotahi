/* eslint-disable camelcase, consistent-return */
const axios = require('axios')
const { map } = require('lodash')

const { useTransaction } = require('@coko/server')
const models = require('@pubsweet/models')

const {
  getLastImportDate,
  getEmptySubmission,
  rawAbstractToSafeHtml,
} = require('./importTools')

const SAVE_CHUNK_SIZE = 50

const getData = async (groupId, ctx, options = {}) => {
  return useTransaction(
    async trx => {
      const activeConfig = await models.Config.getCached(groupId, { trx })

      const [checkIfSourceExists] = await models.ArticleImportSources.query(
        trx,
      ).where({
        server: 'semantic-scholar',
      })

      if (!checkIfSourceExists) {
        await models.ArticleImportSources.query(trx).insert({
          server: 'semantic-scholar',
        })
      }

      const [semanticScholarImportSourceId] =
        await models.ArticleImportSources.query(trx).where({
          server: 'semantic-scholar',
        })

      const sourceId = semanticScholarImportSourceId.id

      const imports = []

      const lastImportDate = await getLastImportDate(sourceId, groupId)

      const manuscripts = await models.Manuscript.query(trx)
        .where({ groupId })
        .orderBy('created', 'desc')

      const selectedManuscripts = manuscripts.filter(
        manuscript => manuscript.submission.$customStatus,
      )

      const latestLimitedSelectedManuscripts = selectedManuscripts.slice(0, 100)

      if (latestLimitedSelectedManuscripts.length > 0) {
        const importDOIParams = []
        latestLimitedSelectedManuscripts.map(manuscript => {
          const DOI = encodeURI(manuscript.submission.doi.split('.org/')[1])
          return importDOIParams.push(`DOI:${DOI}`)
        })

        const importParameters = JSON.stringify({
          positivePaperIds: importDOIParams,
          negativePaperIds: [],
        })

        const semanticSholarRequestUri =
          'https://api.semanticscholar.org/recommendations/v1/papers?limit=500&fields=url,venue,year,externalIds,title,abstract,authors'

        const { data } = await axios.post(
          semanticSholarRequestUri,
          importParameters,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )

        if (data) {
          Array.prototype.push.apply(imports, data.recommendedPapers)
        }

        const importsOnlyWithDOI = imports.filter(
          preprints => preprints.externalIds.DOI,
        )

        await fetchPublicationDatesFromEuropePmc(importsOnlyWithDOI)

        const importsForPastSixWeeks = importsOnlyWithDOI.filter(preprint => {
          if (preprint.firstPublicationDate) {
            const currentDate = new Date().toISOString().split('T')[0]

            const diffDays = Math.floor(
              (Date.parse(currentDate.replace(/-/g, '/')) -
                Date.parse(preprint.firstPublicationDate.replace(/-/g, '/'))) /
                (1000 * 60 * 60 * 24),
            )

            return (
              diffDays <
              Number(
                activeConfig.formData.manuscript
                  .semanticScholarImportsRecencyPeriodDays,
              )
            )
          }

          return false
        })

        const allowedPreprintServers = [
          'bioRxiv',
          'medRxiv',
          'Research Square',
          'ChemRxiv',
          'arXiv',
        ]

        const importsFromSpecificPreprintServers =
          importsForPastSixWeeks.filter(preprint =>
            allowedPreprintServers.includes(preprint.preprintServer),
          )

        const currentDOIs = new Set(
          manuscripts.map(({ submission }) => submission.doi),
        )

        const currentURLs = new Set(
          manuscripts.map(m => m.submission.$sourceUri),
        )

        const withoutDOIDuplicates = importsFromSpecificPreprintServers.filter(
          preprints =>
            !currentDOIs.has(`https://doi.org/${preprints.externalIds.DOI}`),
        )

        const withoutUrlDuplicates = withoutDOIDuplicates.filter(
          preprints => !currentURLs.has(preprints.url),
        )

        const emptySubmission = getEmptySubmission(groupId, { trx })

        const newManuscripts = withoutUrlDuplicates.map(
          ({
            doi,
            title,
            authors,
            abstract,
            date: datePublished,
            url,
            externalIds,
            firstPublicationDate,
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
              datePublished: firstPublicationDate,
              journal: venue,
              $sourceUri: url,
              $doi: externalIds?.DOI || '',
            },
            // separate DOI field for better indexing
            doi: externalIds?.DOI || '',
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

            const inserted =
              // eslint-disable-next-line no-await-in-loop
              await models.Manuscript.query(trx).upsertGraphAndFetch(chunk, {
                relate: true,
              })

            Array.prototype.push.apply(result, inserted)
          }

          if (lastImportDate > 0) {
            await models.ArticleImportHistory.query(trx)
              .update({
                date: new Date().toISOString(),
              })
              .where({ sourceId, groupId })
          } else {
            await models.ArticleImportHistory.query(trx).insert({
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
    },
    { trx: options.trx },
  )
}

async function fetchPublicationDatesFromEuropePmc(importsOnlyWithDOI) {
  await Promise.all(
    map(importsOnlyWithDOI, async preprint => {
      const queryDoi = `DOI:${preprint.externalIds.DOI}`

      const params = {
        query: queryDoi,
        format: 'json',
      }

      let firstPublicationDate, preprintServer

      try {
        const response = await axios.get(
          `https://www.ebi.ac.uk/europepmc/webservices/rest/search`,
          {
            params,
          },
        )

        if (
          response.data.resultList &&
          response.data.resultList.result[0] &&
          response.data.resultList.result[0].bookOrReportDetails
        ) {
          firstPublicationDate =
            response.data.resultList.result[0].firstPublicationDate
          preprintServer =
            response.data.resultList.result[0].bookOrReportDetails.publisher
        }

        return Object.assign(preprint, { firstPublicationDate, preprintServer })
      } catch (e) {
        console.error(e.message)
      }
    }),
  )
}

module.exports = getData
