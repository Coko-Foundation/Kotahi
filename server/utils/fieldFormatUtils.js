const { escape } = require('lodash')

const hasText = v =>
  v &&
  v !== '<p></p>' &&
  v !== '<p class="paragraph"></p>' &&
  typeof v === 'string'

const getPublishableTextFromValue = (value, field) => {
  if (field.component === 'TextField') {
    if (!value || typeof value !== 'string') return null
    return `<p>${escape(value)}</p>`
  }

  if (field.component === 'AbstractEditor') {
    if (!hasText(value)) return null
    return value
  }

  if (field.component === 'CheckboxGroup') {
    if (!Array.isArray(value)) return null

    const optionLabels = value.map(
      val => (field.options.find(o => o.value === val) || { label: val }).label,
    )

    if (!optionLabels.length) return null
    return `<p>${escape(
      field.shortDescription || field.title,
    ).trim()}:</p><ul>${optionLabels
      .map(label => `<li>${escape(label)}</li>`)
      .join('')}</ul>`
  }

  if (['Select', 'RadioGroup'].includes(field.component)) {
    const { label } = field.options.find(o => o.value === value) || {
      label: value,
    }

    return `<p>${escape(
      field.shortDescription || field.title,
    ).trim()}: ${escape(label)}</p>`
  }

  if (field.component === 'LinksInput') {
    if (!value || !value.length) return null

    return `<p>${escape(
      field.shortDescription || field.title,
    ).trim()}:</p><ul>${value
      .map(
        link =>
          `<li><a href="${escape(link.url)}">${escape(link.url)}</a></li>`,
      )
      .join('')}</ul>`
  }

  if (field.component === 'AuthorsInput') {
    if (!Array.isArray(value) || !value.length) return null
    return `<p>${escape(
      field.shortDescription || field.title,
    ).trim()}:</p><ul>${value
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

module.exports = { getPublishableTextFromValue }
