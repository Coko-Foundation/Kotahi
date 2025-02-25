const isValidURL = string => {
  try {
    /* eslint-disable-next-line no-new */
    new URL(string)
    return true
  } catch (error) {
    return false
  }
}

module.exports = { isValidURL }
