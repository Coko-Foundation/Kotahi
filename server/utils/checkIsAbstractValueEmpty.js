const checkIsAbstractValueEmpty = value => {
  if (!value) {
    return true
  }

  return (
    value === '' || value === '<p></p>' || value === '<p class="paragraph"></p>'
  )
}

module.exports = checkIsAbstractValueEmpty
