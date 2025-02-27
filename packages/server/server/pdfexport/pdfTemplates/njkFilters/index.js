const njkFilters = {
  split: (str, separator) => {
    return typeof str !== 'string' ? '' : str.split(separator)
  },
}

module.exports = njkFilters
