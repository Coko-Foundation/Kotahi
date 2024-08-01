const axios = require('axios')
const cheerio = require('cheerio')

const { htmlToJats } = require('../../utils/jatsUtils')

const Config = require('../../../models/config/config.model')

const DOI_PATH_PREFIX = 'https://doi.org/'

const Rights = {
  'tk-notice':
    'Local Contexts Traditional Knowledge (TK) Notice: Recognizes the rights of Indigenous peoples to define the use of their traditional knowledge.',
  'bc-notice':
    'Local Contexts Biocultural (BC) Notice: Recognizes the rights of Indigenous peoples to define the use of information, collections, data, and digital sequence information generated from the biodiversity and genetic resources associated with their traditional lands, waters, and territories.',
  'attribution-incomplete':
    'Local Contexts Attribution-Incomplete: Indicates that the attribution information provided is incomplete and may require additional details or corrections to properly recognize the rights of Indigenous peoples and their knowledge.',
  'open-to-collaborate':
    'Local Contexts Open-to-Collaborate: Signals that the community is open to collaboration and cooperative projects, encouraging partnerships that are respectful and mutually beneficial.',
}

const getDataciteURL = useSandbox =>
  useSandbox === true
    ? 'https://api.test.datacite.org'
    : 'https://api.datacite.org'

const requestToDatacite = (method, path, payload, activeConfig) => {
  const url = getDataciteURL(
    activeConfig.formData.publishing.datacite.useSandbox,
  )

  const auth = Buffer.from(
    `${activeConfig.formData.publishing.datacite.login}:${activeConfig.formData.publishing.datacite.password}`,
  ).toString('base64')

  const authorization = `Basic ${auth}`

  const options = {
    method,
    url: `${url}/${path}`,
    headers: {
      accept: 'application/vnd.api+json',
      authorization,
    },
    data: {
      data: payload,
    },
  }

  return axios.request(options)
}

/** Publish either article or reviews to Datacite, according to config */
const publishToDatacite = async manuscript => {
  const activeConfig = await Config.getCached(manuscript.groupId)

  if (!activeConfig.formData.publishing.datacite.doiPrefix)
    throw new Error(
      'Could not publish to Datacite, as no DOI prefix is configured.',
    )

  await publishArticleToDatacite(manuscript)
}

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

const getContributor = author => {
  if (!author.firstName || !author.lastName)
    throw new Error(`Incomplete author record ${JSON.stringify(author)}`)

  const contributor = {
    nameType: 'Personal',
    givenName: author.firstName,
    familyName: author.lastName,
  }

  if (author.affiliation)
    contributor.affiliation = [{ name: author.affiliation }]

  return contributor
}

/** Returns true if a DOI is not already in use.
 * It will also return true if the Datacite server is faulty or down, so that form submission is not prevented.
 */
const doiIsAvailable = async (checkDOI, activeConfig) => {
  try {
    // Try to find object listed at DOI
    await requestToDatacite('get', `dois/${checkDOI}`, null, activeConfig)

    // eslint-disable-next-line no-console
    console.log(
      `DOI '${checkDOI}' is already taken. Custom suffix is unavailable.`,
    )
    return false // DOI is already in use
  } catch (err) {
    if (err.response.status === 404) {
      // HTTP 404 "Not found" response. The DOI is not known by Datacite
      // console.log(`DOI '${checkDOI}' is available.`)
      return true
    }

    return true
  }
}

const calculateDataciteCitations = text => {
  const $ = cheerio.load(text)

  // console.log($)
  // Select all <p> elements with the data-possible-structures attribute
  const paragraphs = $('p[data-possible-structures]')

  // console.log(paragraphs)
  // Iterate through the selected elements and print them
  const citationDois = []
  paragraphs.each((index, element) => {
    if ($(element).attr('data-possible-structures')) {
      const citation = JSON.parse($(element).attr('data-possible-structures'))

      if (citation.datacite !== '' && citation.datacite.doi) {
        citationDois.push({
          relatedIdentifierType: 'DOI',
          relationType: 'IsCitedBy',
          relatedIdentifier: citation.datacite.doi,
        })
      }
    }
  })

  return citationDois
}

const getRelatedDois = dois => {
  return dois
    .filter(({ doi }) => doi !== '')
    .map(({ doi }) => ({
      relatedIdentifierType: 'DOI',
      relationType: 'HasPart',
      relatedIdentifier: doi,
    }))
}

const createPublisher = config => {
  let publisher = {
    name: config.groupIdentity.title,
  }

  if (config.groupIdentity.rorUrl) {
    publisher = {
      ...publisher,
      publisherIdentifier: config.groupIdentity.rorUrl,
      schemeUri: 'https://ror.org',
      publisherIdentifierScheme: 'ROR',
    }
  }

  return publisher
}

const createContributors = config => {
  const contributor = {
    contributorType: 'Sponsor',
    name: config.groupIdentity.title,
    affiliation: [
      {
        name: config.groupIdentity.title,
      },
    ],
    nameType: 'Organizational',
  }

  if (config.groupIdentity.rorUrl) {
    contributor.affiliation = [
      {
        name: contributor.affiliation[0].name,
        affiliationIdentifierScheme: 'ROR',
        schemeUri: 'https://ror.org',
        affiliationIdentifier: config.groupIdentity.rorUrl,
      },
    ]
  }

  return [contributor]
}

/** Send submission to register an article, with appropriate metadata */
const publishArticleToDatacite = async manuscript => {
  const activeConfig = await Config.getCached(manuscript.groupId)

  if (!activeConfig.formData.groupIdentity.title)
    throw new Error('Configuration Journal Name is not set')
  if (!activeConfig.formData.publishing.datacite.publishedArticleLocationPrefix)
    throw new Error(
      'Configuration needs to set the url where the doi will resolve',
    )
  if (!manuscript.submission)
    throw new Error('Manuscript has no submission object')
  if (!manuscript.submission.$title)
    throw new Error('Manuscript has no submission.$title')
  if (!manuscript.submission.$authors)
    throw new Error('Manuscript has no submission.$authors field')
  if (!Array.isArray(manuscript.submission.$authors))
    throw new Error('Manuscript.submission.$authors is not an array')
  if (!manuscript.submission.resourcetype)
    throw new Error('Manuscript has no submission.resourcetype')

  // const {$title, $issueYear, $authors, } = manuscript.submission

  const issueYear = manuscript.submission.$issueYear
  const publishDate = new Date()

  const doiSuffix = manuscript.id
  const { doiPrefix } = activeConfig.formData.publishing.datacite

  const doi = getDoi(doiSuffix, activeConfig)

  const publishedLocation = `${activeConfig.formData.publishing.datacite.publishedArticleLocationPrefix}${manuscript.shortId}`

  const creators = manuscript.submission.$authors
    ? manuscript.submission.$authors.map(getContributor)
    : []

  const types = {
    resourceTypeGeneral: 'other', // manuscript.submission.resourcetype,
    resourceType: manuscript.submission.ifother,
  }

  const rightsList = [
    {
      rightsUri: manuscript.submission.localcontext,
      rightsIdentifier: manuscript.submission.lcbadges,
      rightsIdentifierScheme: 'Local Contexts',
      schemeUri: 'https://localcontexts.org/',
      rights: Rights[manuscript.submission.lcbadges],
    },
  ]

  const geoLocations = manuscript.submission.geolocation
    ? [
        {
          geoLocationPlace: manuscript.submission.geolocation,
        },
      ]
    : []

  const fundingReferences = manuscript.submission.Funding
    ? [
        {
          funderName: manuscript.submission.Funding,
          funderIdentifierType: manuscript.submission.funderIdentifierType,
          funderIdentifier: manuscript.submission.Funding,
          awardNumber: manuscript.submission.awardnumber
            ? manuscript.submission.awardnumber
            : null,
          awardTitle: manuscript.submission.awardtitle
            ? manuscript.submission.awardtitle
            : null,
          awardUri: manuscript.submission.awarduri
            ? manuscript.submission.awarduri
            : null,
        },
      ]
    : []

  // const relatedItems = []

  // if (
  //   manuscript.submission.$volumeNumber ||
  //   manuscript.submission.$issueNumber
  // ) {
  //   relatedItems.push({
  //     relatedItemType: 'Collection',
  //     relationType: 'IsPublishedIn',
  //     volume: manuscript.submission.$volumeNumber,
  //     issue: manuscript.submission.$issueNumber,
  //   })
  // }

  // if (journalName || journalAbbreviatedName) {
  //   const titles = []

  //   if (journalName) {
  //     titles.push({
  //       title: journalName,
  //     })
  //   }

  //   if (journalAbbreviatedName) {
  //     titles.push({
  //       title: journalAbbreviatedName,
  //       titleType: 'Subtitle',
  //     })
  //   }

  //   relatedItems.push({
  //     relatedItemType: 'Journal',
  //     relationType: 'IsPublishedIn',
  //     titles,
  //   })
  // }

  const titles = manuscript.submission.$title
    ? [
        {
          title: manuscript.submission.$title,
        },
      ]
    : []

  const publisher = createPublisher(activeConfig.formData)

  const contributors = createContributors(activeConfig.formData)

  let relatedIdentifiers = manuscript.meta.source
    ? calculateDataciteCitations(manuscript.meta.source)
    : []

  relatedIdentifiers = relatedIdentifiers.concat(
    getRelatedDois(manuscript.submission.$dois),
  )

  const descriptions = manuscript.submission.$abstract
    ? [
        {
          descriptionType: 'Abstract',
          description: htmlToJats(manuscript.submission.$abstract),
        },
      ]
    : null

  const payload = {
    type: 'dois',
    attributes: {
      doi,
      event: 'publish',
      prefix: doiPrefix,
      suffix: doiSuffix,
      url: publishedLocation,
      types,
      creators,
      publisher,
      contributors,
      titles,
      descriptions,
      dates: [
        { dateType: 'Issued', date: issueYear },
        { dateType: 'Accepted', date: publishDate.toISOString() },
      ],
      publicationYear: publishDate.getUTCFullYear(),
      // relatedItems,
      geoLocations,
      fundingReferences,
      rightsList,
      relatedIdentifiers,
    },
  }

  if (!(await doiIsAvailable(doi, activeConfig))) {
    await requestToDatacite('put', `dois/${doi}`, payload, activeConfig)
  } else {
    await requestToDatacite('post', 'dois', payload, activeConfig)
  }
}

module.exports = {
  publishToDatacite,
  getDoi,
  doiIsAvailable,
}
