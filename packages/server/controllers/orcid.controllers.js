const axios = require('axios')
// const config = require('config')

const ORCID_API =
  /*
  config['auth-orcid'].useSandboxedOrcid &&
  config['auth-orcid'].useSandboxedOrcid.toLowerCase() === 'true'
    ? 'https://pub.sandbox.orcid.org/v3.0'
    : */ 'https://pub.orcid.org/v3.0'

const orcidValidate = async orcidId => {
  const isUrl = orcidId.startsWith('http://') || orcidId.startsWith('https://')
  const url = isUrl ? orcidId : `${ORCID_API}/${orcidId}`

  try {
    const response = await axios.get(url, {
      headers: {
        Accept: 'application/json',
      },
    })

    return response.status === 200
  } catch (error) {
    const { status, statusText } = error?.response || {}

    if (!status) throw new Error('Network Error')
    if (status === 404) return false
    throw new Error(`Error: ${status} - ${statusText}`)
  }
}

module.exports = { orcidValidate }
