import moment from 'moment'

// TODO: memoize
const manuscriptVersions = manuscript => {
  const versions = []
  if (manuscript.manuscriptVersions?.[0]) {
    // TODO: The manuscript versions generally come ordered by
    // created descending, but we could sort them again if need be
    versions.push(...manuscript.manuscriptVersions)
    versions.push(manuscript)
  } else {
    versions.push(manuscript)
  }

  return versions.map((manuscript, index) => ({
    label:
      index === 0
        ? `Current version (${versions.length})`
        : `${moment(manuscript.created).format(
            'YYYY-MM-DD',
          )} (${versions.length - index})`,
    manuscript,
  }))
}

export default manuscriptVersions
