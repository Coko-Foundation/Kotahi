const { DOI_PATH_PREFIX } = require('./constants')

/** Get DOI in form 10.12345/<suffix>
 * If the configured prefix includes 'https://doi.org/' and/or a trailing slash, these are dealt with gracefully. */
const getDoi = (suffix, activeConfig) => {
  let prefix = activeConfig.formData.publishing.datacite.doiPrefix
  if (!prefix) throw new Error('No DOI prefix configured.')
  if (prefix.startsWith(DOI_PATH_PREFIX))
    prefix = prefix.replace(DOI_PATH_PREFIX, '')
  if (prefix.endsWith('/')) prefix = prefix.replace('/', '')
  if (!/^10\.\d{4,9}$/.test(prefix))
    throw new Error(
      `Unrecognised DOI prefix "${activeConfig.formData.publishing.datacite.doiPrefix}"`,
    )
  return `${prefix}/${suffix}`
}

const getDataciteURL = useSandbox => {
  return useSandbox
    ? 'https://api.test.datacite.org'
    : 'https://api.datacite.org'
}

module.exports = {
  getDoi,
  getDataciteURL,
}
