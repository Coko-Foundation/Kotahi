import i18next from 'i18next'
import moment from 'moment'

const getDescendingOrderOfCreation = (mA, mB) =>
  mA.created < mB.created ? 1 : -1

// TODO: memoize
/** Given a parent manuscript, get all versions (including the parent/base manuscript) in descending order of creation (most recent first) */
const manuscriptVersions = manuscript => {
  let versions = []

  if (manuscript.manuscriptVersions?.[0]) {
    versions.push(...manuscript.manuscriptVersions)
  }

  versions.push(manuscript)
  versions = versions.sort(getDescendingOrderOfCreation)

  /* eslint-disable-next-line no-shadow */
  return versions.map((manuscript, index) => ({
    label:
      index === 0
        ? `${i18next.t('manuscriptSubmit.Current version')} (${
            versions.length
          })`
        : `${moment(manuscript.created).format('YYYY-MM-DD')} (${
            versions.length - index
          })`,
    manuscript,
  }))
}

export default manuscriptVersions
