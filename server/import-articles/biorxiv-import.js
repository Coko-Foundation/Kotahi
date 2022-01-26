/* eslint-disable camelcase, consistent-return */
const axios = require('axios')

const models = require('@pubsweet/models')
const ArticleImportSources = require('../model-article-import-sources/src/articleImportSources')
const ArticleImportHistory = require('../model-article-import-history/src/articleImportHistory')
const Form = require('../model-form/src/form')

const {
  ecologyAndSpillover,
  vaccines,
  nonPharmaceuticalInterventions,
  epidemiology,
  diagnostics,
  modeling,
  clinicalPresentationAndPrognosticFactors,
  pharmaceuticalInterventions,
} = require('./topics')

const getData = async ctx => {
  const dateTwoWeeksAgo =
    +new Date(new Date(Date.now()).toISOString().split('T')[0]) - 12096e5

  const articleTopics = {
    Ecology_and_spillover: ecologyAndSpillover,
    Vaccine_development: vaccines,
    Nonpharmaceutical_interventions: nonPharmaceuticalInterventions,
    Epidemiology: epidemiology,
    Diagnostics: diagnostics,
    Disease_modeling: modeling,
    Clinical_presentation: clinicalPresentationAndPrognosticFactors,
    Pharmaceutical_interventions: pharmaceuticalInterventions,
  }

  const [checkIfSourceExists] = await ArticleImportSources.query().where({
    server: 'biorxiv',
  })

  if (!checkIfSourceExists) {
    await ArticleImportSources.query().insert({
      server: 'biorxiv',
    })
  }

  const [biorxivImportSourceId] = await ArticleImportSources.query().where({
    server: 'biorxiv',
  })

  const lastImportDate = await ArticleImportHistory.query()
    .select('date')
    .where({
      sourceId: biorxivImportSourceId.id,
    })

  const requests = async (cursor = 0, minDate, results = []) => {
    const { data } = await axios.get(
      `https://api.biorxiv.org/covid19/${cursor}`,
    )

    const isDatesOutdated = data.collection.some(
      ({ rel_date }) => +new Date(rel_date) < minDate,
    )

    if (isDatesOutdated) {
      const notOutdatedDates = data.collection.filter(
        ({ rel_date }) => +new Date(rel_date) > minDate,
      )

      return results.concat(notOutdatedDates)
    }

    return requests(cursor + 30, minDate, results.concat(data.collection))
  }

  const date = lastImportDate.length ? lastImportDate[0].date : dateTwoWeeksAgo

  const importedManuscripts = await requests(0, date, [])

  const manuscripts = await models.Manuscript.query()

  const currentDOIs = manuscripts.map(({ submission }) => {
    return submission.articleURL
  })

  const withoutDuplicates = importedManuscripts.filter(
    ({ rel_doi, version, rel_site }) =>
      !currentDOIs.includes(
        `https://${rel_site.toLowerCase()}.org/content/${rel_doi}v${version}`,
      ),
  )

  const submissionForm = await Form.findOneByField('purpose', 'submit')

  const parsedFormStructure = submissionForm.structure.children
    .map(formElement => {
      const parsedName = formElement.name && formElement.name.split('.')[1]

      if (parsedName) {
        return {
          name: parsedName,
          component: formElement.component,
        }
      }

      return undefined
    })
    .filter(x => x !== undefined)

  const emptySubmission = parsedFormStructure.reduce((acc, curr) => {
    acc[curr.name] =
      curr.component === 'CheckboxGroup' || curr.component === 'LinksInput'
        ? []
        : ''
    return {
      ...acc,
    }
  }, {})

  // TODO this is a very inefficient way of finding keyword matches
  const newManuscripts = withoutDuplicates
    .map(
      ({
        rel_doi,
        rel_site,
        version,
        rel_title,
        rel_abs,
        rel_date,
        rel_authors,
      }) => {
        const manuscriptTopics = Object.entries(articleTopics)
          .filter(([topicName, topicKeywords]) => {
            return (
              !!topicKeywords[0].filter(keyword => rel_abs.includes(keyword))
                .length &&
              !!topicKeywords[1].filter(keyword => rel_abs.includes(keyword))
                .length
            )
          })
          .map(([topicName]) => topicName)

        if (!manuscriptTopics.length) return null

        const topics = [manuscriptTopics[0]]

        return {
          status: 'new',
          isImported: true,
          importSource: biorxivImportSourceId.id,
          importSourceServer: rel_site.toLowerCase(),
          submission: {
            ...emptySubmission,
            firstAuthor: rel_authors
              ? rel_authors.map(({ author_name }) => author_name).join(', ')
              : [],
            datePublished: rel_date,
            articleURL: `https://${rel_site.toLowerCase()}.org/content/${rel_doi}v${version}`,
            articleDescription: rel_title,
            abstract: rel_abs,
            journal: rel_site,
            topics,
            initialTopicsOnImport: topics,
          },
          meta: {
            title: '',
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
        }
      },
    )
    .filter(Boolean)

  if (!newManuscripts.length) {
    return []
  }

  try {
    const inserted = await models.Manuscript.query().upsertGraphAndFetch(
      newManuscripts,
      { relate: true },
    )

    // const teamsToInsert = insertedManuscripts.map(manuscript => {
    //   return {
    //     manuscriptId: manuscript.id,
    //     ...manuscript.teams[0],
    //   }
    // })

    // const insertedTeams = await models.Team.query().insert(teamsToInsert)

    if (lastImportDate.length) {
      await ArticleImportHistory.query()
        .update({
          date: new Date().toISOString(),
        })
        .where({
          date: lastImportDate[0].date,
        })
    } else {
      await ArticleImportHistory.query().insert({
        date: new Date().toISOString(),
        sourceId: biorxivImportSourceId.id,
      })
    }

    return inserted
  } catch (e) {
    /* eslint-disable-next-line */
    console.error(e.message)
  }
}

module.exports = getData
