const { GoogleSpreadsheet } = require('google-spreadsheet')
const { convert } = require('html-to-text')

const mapping = {
  Clinical_presentation: 'clinical-presentation-prognostic-risk-factors',
  Ecology_and_spillover: 'ecology-spillover',
  Epidemiology: 'epidemiology',
  Nonpharmaceutical_interventions: 'non-pharmaceutical-interventions',
  Vaccine_development: 'vaccines',
  Diagnostics: 'diagnostics',
  Disease_modeling: 'modeling',
  Pharmaceutical_interventions: 'pharmaceutical-interventions',
}

const formatTopicCrossPostMapping = topics =>
  topics.map(topic => mapping[topic])

const mapFieldsToSpreadsheetColumns = manuscript => {
  const { submission } = manuscript

  const importSourceServer = manuscript.importSourceServer
    ? `(${manuscript.importSourceServer})`
    : ''

  const topicsAsArray = Array.isArray(submission.topics)
    ? submission.topics
    : [submission.topics]

  const initialTopicsAsArray = Array.isArray(submission.initialTopicsOnImport)
    ? submission.initialTopicsOnImport
    : [submission.initialTopicsOnImport]

  const topics = (manuscript.isImported
    ? initialTopicsAsArray
    : topicsAsArray
  ).filter(topic => !!mapping[topic])

  // eslint-disable-next-line camelcase
  const cross_post = (manuscript.isImported
    ? [...new Set(initialTopicsAsArray.concat(topicsAsArray))]
    : topicsAsArray
  ).filter(topic => !!mapping[topic])

  return {
    uuid: manuscript.id,
    title_journal: `${submission.$title} ${importSourceServer}`,
    Title: submission.$title || '',
    Topic: topics.join(';') || '',
    'First Author': submission.firstAuthor || '',
    'Date Published': submission.datePublished || '',
    link: submission.$sourceUri || '',
    'Our Take': String(convert(submission.ourTake || '', { wordwrap: false })),
    value_added: String(
      convert(submission.valueAdded || '', { wordwrap: false }),
    ),
    study_population_setting: String(
      convert(submission.studyPopulationSetting || '', { wordwrap: false }),
    ),
    study_strength: String(
      convert(submission.studyStrengths || '', { wordwrap: false }),
    ),
    limitations: String(
      convert(submission.limitations || '', { wordwrap: false }),
    ),
    journal: submission.journal || '',
    cross_post: formatTopicCrossPostMapping(cross_post).join(';') || '',
    reviewer: submission.reviewer || '',
    edit_date: new Date().toISOString().split('T')[0],
    compendium_feature: submission.compendiumFeature || '',
    Study_Design: submission.studyDesign || '',
    review_creator: submission.reviewCreator || '',
    edit_finished: 'TRUE',
    Subtopic_Tag:
      (submission.subTopics && submission.subTopics.join(';')) || '',
    main_findings: convert(submission.summaryOfMainFindings || '', {
      wordwrap: false,
    }),
    keywords: 'NA',
    final_take_wordcount: '5', // TODO Is this correct?
  }
}

const publishToGoogleSpreadSheet = async manuscript => {
  try {
    const forPublishingData = mapFieldsToSpreadsheetColumns(manuscript)
    const { link } = forPublishingData

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID)

    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SPREADSHEET_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SPREADSHEET_PRIVATE_KEY.replace(
        /\\n/g,
        '\n',
      ),
    })

    await doc.loadInfo()
    const sheet = doc.sheetsByIndex[0]
    const rows = await sheet.getRows()

    const indexOfExistingArticle = rows.findIndex(row => row.link === link)

    const fieldsOrder = Object.keys(forPublishingData)

    if (indexOfExistingArticle !== -1) {
      fieldsOrder.forEach(fieldName => {
        rows[indexOfExistingArticle][fieldName] =
          forPublishingData[fieldName] || ''
      })
      // eslint-disable-next-line
      console.log('updating row')
      // eslint-disable-next-line
      console.log(rows[indexOfExistingArticle])
      await rows[indexOfExistingArticle].save()
    } else {
      // eslint-disable-next-line
      console.log('insert new row')
      // eslint-disable-next-line
      console.log('forPublishingData')
      // eslint-disable-next-line
      console.log(forPublishingData)
      await sheet.addRow({ ...forPublishingData })
    }

    return manuscript.id
  } catch (e) {
    // eslint-disable-next-line
    console.log('error while publishing to google spreadsheet')
    // eslint-disable-next-line
    console.log(e)
    throw new Error('Error while publishing to google spreadsheet')
  }
}

module.exports = publishToGoogleSpreadSheet
