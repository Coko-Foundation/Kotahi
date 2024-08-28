const axios = require('axios')
// const config = require('config')

const ORCID_API =
  /*
  config['auth-orcid'].useSandboxedOrcid &&
  config['auth-orcid'].useSandboxedOrcid.toLowerCase() === 'true'
    ? 'https://pub.sandbox.orcid.org/v3.0'
    : */ 'https://pub.orcid.org/v3.0'

const orcidValidate = async orcidId => {
  const url = `${ORCID_API}/${orcidId}`

  try {
    const response = await axios.get(url, {
      headers: {
        Accept: 'application/json',
      },
    })

    return response.status === 200
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) return false
      throw new Error(
        `Error: ${error.response.status} - ${error.response.statusText}`,
      )
    }

    throw new Error(`Network or other error: ${error.message}`)
  }
}

module.exports = { orcidValidate }
