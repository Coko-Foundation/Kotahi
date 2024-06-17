const { default: axios } = require('axios')
const rateLimit = require('axios-rate-limit')
const { createFormattedReference } = require('../reference/src/formatting')

const http = rateLimit(axios.create(), {
  maxRequests: 10,
  perMilliseconds: 1000,
})

const apiUrl = 'https://api.crossref.org/v1/works/'
const defaultMailTo = 'unknown@unknown.com'

/** Pass the response of every CrossRef API call to this function to ensure rate limits are updated */
const updateRateLimit = response => {
  const maxRequests = parseInt(
    response.headers['x-rate-limit-limit'] ?? '0',
    10,
  )

  const perMilliseconds =
    parseInt(response.headers['x-rate-limit-interval'] ?? '0', 10) * 1000

  if (maxRequests && perMilliseconds)
    http.setRateLimitOptions({
      maxRequests,
      // We're slowing down further by a small arbitrary factor, as CrossRef sometimes gives
      // HTTP 429 errors if we go at the speed it nominates.
      perMilliseconds: perMilliseconds * 1.1,
    })
}

// Note that unlike CrossRef, DataCite doesn't impose rate limits, though their firewall
// imposes a hard limit of around 10 queries/sec from a single IP address.
const getUrlByDoiFromDataCite = async doi => {
  try {
    const response = await axios.get(`https://doi.org/api/handles/${doi}`)

    if (response.status === 200) {
      const url = response.data?.values?.[0]?.data?.value
      // Check if the URL exists in the response
      if (url) return url
      // eslint-disable-next-line no-console
      console.log(`No URL found for DOI ${doi} in DataCite response.`)
      return null
    }

    console.error(
      `Failed to retrieve URL for DOI ${doi} from DataCite: ${response.statusText}`,
    )
    return null
  } catch (error) {
    if (error.response.status === 404)
      // eslint-disable-next-line no-console
      console.log(`Unknown DOI ${doi}. DataCite cannot return URL for this.`)
    else
      console.error(
        `Failed to retrieve URL from DataCite for DOI ${doi}: ${error}`,
      )
    return null
  }
}

/** Get the target URL that a DOI resolves to. This attempts to obtain it from CrossRef first (observing rate limiting),
 * and failing that, from DataCite.
 * @param contactEmail An email address to supply in the header to CrossRef in case they need to contact about rate limiting etc.
 */
const getUrlByDoi = async (doi, contactEmail) => {
  const mailTo = contactEmail ?? defaultMailTo

  try {
    const response = await http.get(`${apiUrl}${doi}`, {
      params: {
        mailto: mailTo,
      },
      headers: {
        'User-Agent': `Kotahi (Axios 0.21; mailto:${mailTo})`,
      },
    })

    updateRateLimit(response)

    if (response.status === 200)
      return response.data.message?.resource?.primary?.URL

    console.error(
      `Could not retrieve URL for DOI ${doi}: ${response.statusText}`,
    )
    return null
  } catch (error) {
    if (error.response?.status === 404) {
      // DataCite appears to be capable of retrieving URLs for all agencies, though it's slower than CrossRef.
      // If we have trouble with DataCite, we can determine the agency as follows and then use that agency's API:
      //
      // const agencyResponse = await http.get(`${apiUrl}${doi}/agency`)
      // updateRateLimit(agencyResponse)
      // const agency = agencyResponse.data?.message?.agency?.id

      return getUrlByDoiFromDataCite(doi)
    }

    if (error.response?.status === 429) {
      // TODO Consider implementing a backoff
      return getUrlByDoiFromDataCite(doi) // Get from alternative service that's generally slower, but shouldn't give 429 error
    }

    console.error(
      `Failed to retrieve URL from CrossRef for DOI ${doi}: ${error}`,
    )
    return null
  }
}

const getFormattedReferencesFromCrossRef = async (
  reference,
  count,
  crossrefRetrievalEmail,
  groupId,
) => {
  try {
    const response = await http.get('https://api.crossref.org/v1/works', {
      params: {
        'query.bibliographic': reference,
        rows: count,
        select: 'DOI,author,issue,page,title,volume,container-title,issued',
        mailto: crossrefRetrievalEmail || defaultMailTo,
        order: 'desc',
        sort: 'score',
      },
      timeout: 15000,
      headers: {
        'User-Agent': `Kotahi (Axios 0.21; mailto:${
          crossrefRetrievalEmail || defaultMailTo
        })`,
      },
    })

    updateRateLimit(response)

    if (response.status === 200)
      return response.data.message.items.reduce(
        (accumulator, current, index) => {
          accumulator.push(createFormattedReference(current, groupId))
          return accumulator
        },
        [],
      )

    console.error('Crossref failure!', response)
    return []
  } catch (error) {
    if (error.response?.status === 404) {
      console.error('Crossref 404 error!')
    }

    if (error.response?.status === 429) {
      // TODO Consider implementing a backoff
      // return getUrlByDoiFromDataCite(doi) // Get from alternative service that's generally slower, but shouldn't give 429 error
      console.error('Crossref rate limit error!!!')
    }

    console.error('Crossref failure!', error.message)
    return []
  }
}

module.exports = { getUrlByDoi, getFormattedReferencesFromCrossRef }
