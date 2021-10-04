/** Return true if value is falsey or empty HTML, OR if it is an array of values that are all falsey or empty HTML */
const checkIsAbstractValueEmpty = value => {
  if (!value) {
    return true
  }

  if (Array.isArray(value)) {
    return value
      .map(
        val =>
          val === '' ||
          val === '<p></p>' ||
          val === '<p class="paragraph"></p>',
      )
      .every(verifiedValue => verifiedValue === true)
  }

  return (
    value === '' || value === '<p></p>' || value === '<p class="paragraph"></p>'
  )
}

module.exports = checkIsAbstractValueEmpty
