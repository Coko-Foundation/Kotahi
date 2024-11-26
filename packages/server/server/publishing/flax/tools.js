// We need to make this utility bit more generic so that we can use it in different publishing sites.

const { get } = require('lodash')
const { getPublishableTextFromValue } = require('../../utils/fieldFormatUtils')

const getPublishableTextFromComment = commentObject => {
  if (!commentObject.commentVersions || !commentObject.commentVersions.length)
    return null

  return commentObject.commentVersions[commentObject.commentVersions.length - 1]
    .comment
}

const getPublishableFieldsForFlax = (
  adHocFieldsToPublish,
  data,
  form,
  threadedDiscussions,
  objectId,
  objectDate,
  formType,
) => {
  if (!form) return []

  const {
    structure: { children: fields },
  } = form

  return fields
    .filter(f => ['always', 'true'].includes(f.permitPublishing))
    .map(field => {
      let fieldName = field.name

      if (formType === 'submission') {
        fieldName = field.name.replace('submission.', '')
        fieldName = fieldName.replace('meta.', '')
      }

      const value = get(data, fieldName)

      if (field.component === 'ThreadedDiscussion') {
        const discussion = threadedDiscussions.find(td => td.id === value)
        if (!discussion) return []

        return discussion.threads.map(t =>
          t.comments.map(c => {
            const text = getPublishableTextFromComment(c)
            const expandedFieldName = `${field.name}:${c.id}`

            const shouldPublish =
              text &&
              (field.permitPublishing === 'always' ||
                adHocFieldsToPublish.includes(expandedFieldName))

            return {
              field,
              fieldName: expandedFieldName,
              fieldTitle: field.shortDescription || field.title,
              text,
              date: c.created,
              shouldPublish,
              objectId,
            }
          }),
        )
      }

      const text = getPublishableTextFromValue(value, field)

      const shouldPublish =
        text &&
        (field.permitPublishing === 'always' ||
          adHocFieldsToPublish.includes(field.name))

      return {
        field,
        value,
        fieldName: field.name,
        fieldTitle: field.shortDescription || field.title,
        text,
        date: objectDate,
        shouldPublish,
        objectId,
      }
    })
    .flat(3)
}

/** Returns an entry for all fields that could be published, whether they are selected for publishing or not.
 * Each entry contains the field specification, the data value, and whether that field should be published.
 * ThreadedDiscussions are treated specially. Instead of one entry for the ThreadedDiscussion field, there are multiple
 * entries, one for each comment.
 */

const getPublishableReviewFields = (
  reviews,
  form,
  threadedDiscussions,
  manuscript,
) => {
  const resultReviews = reviews

  resultReviews.map(review => {
    const resultReview = review

    const adHocFieldsToPublish =
      manuscript.formFieldsToPublish.find(ff => ff.objectId === review.id)
        ?.fieldsToPublish ?? []

    const modifiedJsonData = getPublishableFieldsForFlax(
      adHocFieldsToPublish,
      JSON.parse(review.jsonData),
      form,
      threadedDiscussions,
      review.id,
      review.updated,
      'reviews',
    ).filter(data => data.shouldPublish)

    resultReview.jsonData = JSON.stringify(modifiedJsonData)
    return resultReview
  })

  return resultReviews
}

const getPublishableSubmissionFields = (form, manuscript) => {
  let submissionWithFields = {}
  const manuscriptData = manuscript.submission

  const adHocFieldsToPublish =
    manuscript.formFieldsToPublish.find(f => f.objectId === manuscript.id)
      ?.fieldsToPublish ?? []

  const modifiedJsonData = getPublishableFieldsForFlax(
    adHocFieldsToPublish,
    manuscriptData,
    form,
    null,
    manuscript.id,
    manuscript.updated,
    'submission',
  ).filter(data => data.shouldPublish)

  submissionWithFields = JSON.stringify(modifiedJsonData)
  return submissionWithFields
}

module.exports = {
  getPublishableReviewFields,
  getPublishableSubmissionFields,
}
