const { default: axios } = require('axios')
const { createFormattedReference } = require('../reference/src/formatting')

const getFormattedReferencesFromDatacite = async (doi, groupId) => {
  try {
    const response = await axios.get(
      `https://api.datacite.org/application/vnd.citationstyles.csl+json/${doi}`,
      // `https://data.crosscite.org/application/vnd.citationstyles.csl+json/${doi}`,
    )

    if (response.status === 200) {
      // console.log('Response: ', response.data)

      const formatted = await createFormattedReference(
        response.data,
        groupId,
        true,
      )

      // console.log('Formatted: ', formatted)
      return [formatted]
    }

    console.error('Datacite failure!', response)
    return []
  } catch (error) {
    if (error.response?.status === 404) {
      console.error(`Datacite 404 error: DOI ${doi} not found at Datacite.`)
    }

    if (error.response?.status === 429) {
      // TODO Consider implementing a backoff
      console.error('Datacite rate limit error!')
    }

    console.error('Datacite failure!', error.message)
    return []
  }
}

module.exports = { getFormattedReferencesFromDatacite }
