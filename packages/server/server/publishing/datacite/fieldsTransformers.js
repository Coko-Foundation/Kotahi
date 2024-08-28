const cheerio = require('cheerio')
const htmlToJats = require('../../jatsexport/htmlToJats')
const { RIGHTS } = require('./constants')

const calculateDataciteCitations = text => {
  const $ = cheerio.load(text)
  // Select all <p> elements with the data-possible-structures attribute
  const paragraphs = $('p[data-possible-structures]')
  // Iterate through the selected elements and print them
  const citationDois = []
  paragraphs.each((_, element) => {
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

const getPublisher = formData => {
  let publisher = {
    name: formData.groupIdentity.title,
  }

  if (formData.groupIdentity.rorUrl) {
    publisher = {
      ...publisher,
      publisherIdentifier: formData.groupIdentity.rorUrl,
      schemeUri: 'https://ror.org',
      publisherIdentifierScheme: 'ROR',
    }
  }

  return publisher
}

const getContributor = author => {
  if (!author.firstName || !author.lastName)
    throw new Error(`Incomplete author record ${JSON.stringify(author)}`)

  const contributor = {
    nameType: 'Personal',
    givenName: author.firstName,
    familyName: author.lastName,
  }

  if (author.orcid) {
    contributor.nameIdentifier = [
      {
        nameIdentifierScheme: 'ORCID',
        schemeUri: 'https://orcid.org',
        value: author.orcid,
      },
    ]
  }

  if (author.ror) {
    contributor.affiliation = [
      {
        affiliationIdentifier: author.ror,
        affiliationIdentifierScheme: 'ROR',
        schemeUri: 'https://ror.org',
      },
    ]
  }

  return contributor
}

const getContributors = formData => {
  const contributor = {
    contributorType: 'Sponsor',
    name: formData.groupIdentity.title,
    affiliation: [
      {
        name: formData.groupIdentity.title,
      },
    ],
    nameType: 'Organizational',
  }

  if (formData.groupIdentity.rorUrl) {
    contributor.affiliation = [
      {
        name: contributor.affiliation[0].name,
        affiliationIdentifierScheme: 'ROR',
        schemeUri: 'https://ror.org',
        affiliationIdentifier: formData.groupIdentity.rorUrl,
      },
    ]
  }

  return [contributor]
}

const getRightsList = (localcontext, lcbadges) => {
  return [
    {
      rightsUri: localcontext,
      rightsIdentifier: lcbadges,
      rightsIdentifierScheme: 'Local Contexts',
      schemeUri: 'https://localcontexts.org/',
      rights: RIGHTS[lcbadges],
    },
  ]
}

const getFundingReferences = submission => {
  const { funderIdentifierType, Funding, awardnumber, awardtitle, awarduri } =
    submission

  return Funding
    ? [
        {
          funderName: Funding,
          funderIdentifierType,
          funderIdentifier: Funding,
          awardNumber: awardnumber || null,
          awardTitle: awardtitle || null,
          awardUri: awarduri || null,
        },
      ]
    : []
}

const getDescriptions = $abstract => {
  return $abstract
    ? [
        {
          descriptionType: 'Abstract',
          description: htmlToJats($abstract),
        },
      ]
    : []
}

const getRelatedIdentifiers = (meta, $dois) => {
  return [
    ...(meta.source ? [calculateDataciteCitations(meta.source)] : []),
    ...getRelatedDois($dois),
  ]
}

const getRelatedDois = dois => {
  const doiUrl = 'https://doi.org/'
  return dois
    ? dois
        .filter(({ doi }) => doi !== '')
        .map(({ doi }) => ({
          relatedIdentifierType: 'DOI',
          relationType: 'HasPart',
          relatedIdentifier: doi.startsWith(doiUrl)
            ? doi.substring(doiUrl.length)
            : doi,
        }))
    : []
}

const getDates = (issueYear, publishDate) => {
  return [
    { dateType: 'Issued', date: issueYear },
    { dateType: 'Accepted', date: publishDate.toISOString() },
  ]
}

// eslint-disable-next-line no-unused-vars
const getRelatedItems = (submission, formData) => {
  const {
    groupIdentity: { journalName, journalAbbreviatedName },
  } = formData

  const relatedItems = []

  if (submission.$volumeNumber || submission.$issueNumber) {
    relatedItems.push({
      relatedItemType: 'Collection',
      relationType: 'IsPublishedIn',
      volume: submission.$volumeNumber,
      issue: submission.$issueNumber,
    })
  }

  if (journalName || journalAbbreviatedName) {
    const titles = []

    if (journalName) {
      titles.push({
        title: journalName,
      })
    }

    if (journalAbbreviatedName) {
      titles.push({
        title: journalAbbreviatedName,
        titleType: 'Subtitle',
      })
    }

    relatedItems.push({
      relatedItemType: 'Journal',
      relationType: 'IsPublishedIn',
      titles,
    })
  }

  return relatedItems
}

module.exports = {
  getDates,
  getContributor,
  getPublisher,
  getContributors,
  getDescriptions,
  getRightsList,
  getFundingReferences,
  getRelatedIdentifiers,
}
