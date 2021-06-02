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
      .some(verifiedValue => verifiedValue === true)
  }

  return (
    value === '' || value === '<p></p>' || value === '<p class="paragraph"></p>'
  )
}

module.exports = checkIsAbstractValueEmpty
