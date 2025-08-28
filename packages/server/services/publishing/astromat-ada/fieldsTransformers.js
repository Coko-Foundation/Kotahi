const getContributor = isContributor => author => {
  if (!author.firstName || !author.lastName)
    throw new Error(`Incomplete author record ${JSON.stringify(author)}`)

  const contributor = {
    nameType: 'Personal',
    fullName: `${author.lastName}, ${author.firstName}`,
    email: author.email || '',
    orcid: author.orcid || 'https://orcid.org/0009-0003-8157-0637',
    ror: author.ror || '',
    ...(isContributor ? { contributorType: 'Researcher' } : {}),
  }

  return contributor
}

const getLicenses = submission => {
  const keys = ['licenseName', 'licenseAbbreviation', 'licenseUrl']

  const licenses = []
  let i = 1

  // eslint-disable-next-line no-loop-func
  while (keys.some(key => submission[`${key}${i}`])) {
    licenses.push({
      name: submission[`licenseName${i}`],
      abbreviation: submission[`licenseAbbreviation${i}`],
      url: submission[`licenseUrl${i}`],
    })

    // eslint-disable-next-line no-plusplus
    i++
  }

  return licenses
}

const getFundingReferences = submission => {
  const keys = [
    'funderName',
    'funderAbbreviation',
    'funderUrl',
    'awardnumber',
    'awardtitle',
    'awarduri',
  ]

  const fundingReferences = []
  let i = 1

  // eslint-disable-next-line no-loop-func
  while (keys.some(key => submission[`${key}${i}`])) {
    const funderName = submission[`funderName${i}`]
    const funderAbreviation = submission[`funderAbbreviation${i}`]
    const funderUrl = submission[`funderUrl${i}`]
    const awardnumber = submission[`awardnumber${i}`]
    const awardtitle = submission[`awardtitle${i}`]
    const awarduri = submission[`awarduri${i}`]

    fundingReferences.push({
      funder: {
        abbreviation: funderAbreviation,
        name: funderName,
        url: funderUrl,
      },
      awardNumber: awardnumber || null,
      awardTitle: awardtitle || null,
      awardUri: awarduri || null,
    })

    // eslint-disable-next-line no-plusplus
    i++
  }

  return fundingReferences
}

const getFormattedFiles = files => {
  return files.map(file => {
    // not needed currently, but may be in the future
    // const originalMetadata = file.storedObjects.find(o => o.type === 'original')
    // const { bucket } = file.meta

    return {
      generalType: 'Image',
      name: file.name,
      // not needed currently, but may be in the future
      //   processPath: `${bucket}/${originalMetadata.key}`,
    }
  })
}

module.exports = {
  getContributor,
  getFormattedFiles,
  getFundingReferences,
  getLicenses,
}
