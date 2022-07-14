const { get, escape } = require('lodash')

const MAX_REVIEW_COUNT = 10

const hasText = v =>
  v &&
  v !== '<p></p>' &&
  v !== '<p class="paragraph"></p>' &&
  typeof v === 'string'

const getPublishableTextFromComment = commentObject => {
  if (!commentObject.commentVersions || !commentObject.commentVersions.length)
    return null

  const comment =
    commentObject.commentVersions[commentObject.commentVersions.length - 1]

  const authorName = commentObject.commentVersions[0].author.username

  if (!hasText(comment.comment)) return null
  return `<p><b>${escape(authorName)}:</b></p>${comment.comment}`
}

const getPublishableTextFromValue = (value, field) => {
  if (field.component === 'TextField') {
    if (!value) return null
    return `<p>${escape(value)}</p>`
  }

  if (field.component === 'AbstractEditor') {
    if (!hasText(value)) return null
    return value
  }

  if (field.component === 'CheckboxGroup') {
    if (!value) return null

    const optionLabels = value.map(
      val => (field.options.find(o => o.value === val) || { label: val }).label,
    )

    if (!optionLabels.length) return null
    return `<p>${escape(
      field.shortDescription || field.title,
    )}:</p><ul>${optionLabels
      .map(label => `<li>${escape(label)}</li>`)
      .join('')}</ul>`
  }

  if (['Select', 'RadioGroup'].includes(field.component)) {
    const { label } = field.options.find(o => o.value === value) || {
      label: value,
    }

    return `<p>${escape(field.shortDescription || field.title)}: ${escape(
      label,
    )}</p>`
  }

  if (field.component === 'LinksInput') {
    if (!value || !value.length) return null

    return `<p>${escape(
      field.shortDescription || field.title,
    )}:</p><ul>${value
      .map(
        link =>
          `<li><a href="${escape(link.url)}">${escape(link.url)}</a></li>`,
      )
      .join('')}</ul>`
  }

  if (field.component === 'AuthorsInput') {
    if (!value || !value.length) return null
    return `<p>${escape(field.shortDescription || field.title)}:</p><ul>${value
      .map(author => {
        const escapedName = escape(`${author.firstName} ${author.lastName}`)

        const affiliationMarkup = author.affiliation
          ? ` (${escape(author.affiliation)})`
          : ''

        const emailMarkup = author.email
          ? ` <a href="mailto:${escape(author.email)}">${escape(
              author.email,
            )}</a>`
          : ''

        return `<li>${escapedName}${affiliationMarkup}${emailMarkup}</li>`
      })
      .join('')}</ul>`
  }

  return value
}

const getPublishableFieldsForObject = (
  formFieldsToPublish,
  data,
  form,
  threadedDiscussions,
  objectId,
) => {
  if (!form) return []
  const { fieldsToPublish } = formFieldsToPublish || { fieldsToPublish: [] }

  const {
    structure: { children: fields },
  } = form

  return fields
    .filter(f => f.permitPublishing === 'true' && f.hideFromAuthors !== 'true')
    .map(field => {
      const { publishingTag } = field
      const value = get(data, field.name)

      if (field.component === 'ThreadedDiscussion') {
        const discussion = threadedDiscussions.find(td => td.id === value)
        if (!discussion) return []

        return discussion.threads.map(t =>
          t.comments.map(c => {
            const text = getPublishableTextFromComment(c)
            const expandedFieldName = `${field.name}:${c.id}`

            const shouldPublish =
              text && fieldsToPublish.includes(expandedFieldName)

            return {
              field,
              fieldName: expandedFieldName,
              text,
              shouldPublish,
              publishingTag,
              objectId,
            }
          }),
        )
      }

      const text = getPublishableTextFromValue(value, field)
      const shouldPublish = text && fieldsToPublish.includes(field.name)
      return {
        field,
        fieldName: field.name,
        text,
        shouldPublish,
        publishingTag,
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
const getPublishableFields = (manuscript, forms, threadedDiscussions) => {
  const result = []

  result.push(
    ...getPublishableFieldsForObject(
      manuscript.formFieldsToPublish.find(ff => ff.objectId === manuscript.id),
      manuscript,
      forms.find(f => f.category === 'submission'),
      threadedDiscussions,
      manuscript.id,
    ),
  )

  manuscript.reviews
    .filter(r => r.isDecision)
    .forEach(r =>
      result.push(
        ...getPublishableFieldsForObject(
          manuscript.formFieldsToPublish.find(ff => ff.objectId === r.id),
          r.jsonData,
          forms.find(f => f.category === 'decision'),
          threadedDiscussions,
          r.id,
        ),
      ),
    )

  manuscript.reviews
    .sort((a, b) => a.created - b.created)
    .filter(r => !r.isDecision)
    .forEach(r =>
      result.push(
        ...getPublishableFieldsForObject(
          manuscript.formFieldsToPublish.find(ff => ff.objectId === r.id),
          r.jsonData,
          forms.find(f => f.category === 'review'),
          threadedDiscussions,
          r.id,
        ),
      ),
    )

  return result.map(d => {
    const annotationName = `${d.objectId}.${d.fieldName}`
    const annotationId = manuscript.evaluationsHypothesisMap[annotationName]
    const hasPreviousValue = !!annotationId
    let action
    if (d.shouldPublish) action = hasPreviousValue ? 'update' : 'create'
    else action = hasPreviousValue ? 'delete' : null
    return { ...d, annotationName, annotationId, action }
  })
}

/** If the URI published to hypothes.is doesn't match the URI of the viewed page, annotations will not be visible in the context of that page.
 * This especially impacts biorxiv items, which are imported without a subdomain, but are given the www subdomain when viewing the page.
 * Here we fix that.
 */
const normalizeUri = uri =>
  uri.replace('https://biorxiv.org/', 'https://www.biorxiv.org/')

module.exports = {
  hasText,
  getPublishableFields,
  normalizeUri,
  MAX_REVIEW_COUNT,
}
