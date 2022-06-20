const checkIsAbstractValueEmpty = require('../../utils/checkIsAbstractValueEmpty')
const { ensureJsonIsParsed } = require('../../utils/objectUtils')

const stripConfidentialDataFromReviews = (
  reviews,
  reviewForm,
  decisionForm,
) => {
  if (!reviewForm || !decisionForm) return []

  const confidentialReviewFields = reviewForm.structure.children
    .filter(field => field.hideFromAuthors === 'true')
    .map(field => field.name)

  const confidentialDecisionFields = decisionForm.structure.children
    .filter(field => field.hideFromAuthors === 'true')
    .map(field => field.name)

  return reviews
    .filter(r => !r.isHiddenFromAuthor)
    .map(review => {
      const r = { ...review, jsonData: ensureJsonIsParsed(review.jsonData) }
      if (r.isHiddenReviewerName) r.userId = null

      const confidentialFields = r.isDecision
        ? confidentialDecisionFields
        : confidentialReviewFields

      const filteredJsonData = {}

      Object.entries(r.jsonData).forEach(([key, value]) => {
        if (!confidentialFields.includes(key)) filteredJsonData[key] = value
      })
      r.jsonData = filteredJsonData
      return r
    })
}

const fixMissingValuesInFilesInSingleMsVersion = ms => {
  const result = { ...ms }

  if (ms.files)
    result.files = ms.files.map(f => ({
      ...f,
      tags: f.tags || [],
      storedObjects: f.storedObjects || [],
    }))

  return result
}

/** Returns a new manuscript object in which null/undefined files, file tags and file storedObjects are replaced with []. */
const fixMissingValuesInFiles = ms => {
  const result = fixMissingValuesInFilesInSingleMsVersion(ms)
  if (result.manuscriptVersions)
    result.manuscriptVersions = result.manuscriptVersions.map(v =>
      fixMissingValuesInFilesInSingleMsVersion(v),
    )

  return result
}

/** Get evaluations as
 * [
 *  [submission.review1, submission.review1date],
 *  [submission.review2, submission.review2date],
 *  ...,
 *  [submission.summary, submission.summarydate]
 * ]
 * These are evaluations in the submission form, NOT normal reviews. */
const getEvaluationsAndDates = manuscript => {
  const evaluationValues = Object.entries(manuscript.submission)
    .filter(
      ([prop, value]) =>
        !Number.isNaN(Number(prop.split('review')[1])) &&
        prop.includes('review'),
    )
    .map(([propName, value]) => [
      value,
      manuscript.submission[`${propName}date`],
    ])

  evaluationValues.push([
    manuscript.submission.summary,
    manuscript.submission.summarydate,
  ])

  return evaluationValues
}

const hasEvaluations = manuscript => {
  const evaluations = getEvaluationsAndDates(manuscript)
  return evaluations.map(checkIsAbstractValueEmpty).some(isEmpty => !isEmpty)
}

module.exports = {
  stripConfidentialDataFromReviews,
  fixMissingValuesInFiles,
  hasEvaluations,
}
