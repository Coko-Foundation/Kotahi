const { GoogleSpreadsheet } = require('google-spreadsheet')

const mapFieldsToSpreadsheetColumns = manuscript => {
  const { submission } = manuscript

  const importSourceServer = manuscript.importSourceServer
    ? `(${manuscript.importSourceServer})`
    : ''

  return {
    uuid: manuscript.id,
    title_journal: `${submission.articleDescription} ${importSourceServer})`,
    Title: submission.articleDescription || '',
    Topic: submission.topics.join(', ') || '',
    'First Author': submission.firstAuthor || '',
    'Date Published': submission.datePublished || '',
    link: submission.articleURL || '',
    'Our Take': submission.ourTake || '',
    value_added: submission.valueAdded || '',
    study_population_setting: submission.studyPopulationSetting || '',
    study_strength: submission.studyStrengths || '',
    limitations: submission.limitations || '',
    keywords: submission.keywords || '',
    journal: submission.journal || '',
    cross_post: '',
    edit_finished: submission.editFinished || '',
    reviewer: submission.reviewer || '',
    edit_date: new Date().toISOString().split('T')[0],
    final_take_wordcount: submission.wordcount || '',
    compendium_feature: submission.compendiumFeature || '',
    Study_Design: submission.studyDesign || '',
    Subtopic_Tag: '',
    review_creator: submission.reviewCreator || '',
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
    console.log('error while publishing in google spreadsheet')
    // eslint-disable-next-line
    console.log(e)
    return null
  }
}

module.exports = publishToGoogleSpreadSheet
