const { LRUCache } = require('lru-cache')

const cache = new LRUCache({
  max: 500,
  ttl: 10000,
})

let models = null // Upon first use this will be set to require('@pubsweet/models')

const queryFunctions = {
  userIsGM: async (userId, groupId) => {
    const groupManagerRecord = await models.Team.query()
      .withGraphJoined('members')
      .findOne({ role: 'groupManager', objectId: groupId, userId })

    return !!groupManagerRecord
  },
  /** Gets the manuscript that owns a particular file, either directly or via one of its review objects.
   * Note that this will throw an exception for files  not owned by a manuscript,
   * such as CMS files.
   */
  msOfFile: async fileId => {
    const file = await models.File.query().findById(fileId)

    if (!file?.objectId) {
      console.error('File without objectId encountered:', file)
      return null
    }

    // The file may belong to a review or directly to a manuscript
    const review = await models.Review.query().findById(file.objectId)

    const manuscript = await models.Manuscript.query().findById(
      review ? review.manuscriptId : file.objectId,
    )

    return manuscript
  },
  userIsAdmin: async userId => {
    const adminRecord = await models.Team.query()
      .withGraphJoined('members')
      .findOne({ role: 'admin', global: true, userId })

    const isAdmin = !!adminRecord
    return isAdmin
  },
  userIsEditor: async (userId, manuscriptId) => {
    const teamRecord = await models.User.relatedQuery('teams')
      .for(userId)
      .findOne(builder =>
        builder
          .where({ role: 'seniorEditor' })
          .orWhere({ role: 'handlingEditor' })
          .orWhere({ role: 'editor' }),
      )
      .where({ objectId: manuscriptId })
      .select('teams.id')

    const isEditor = !!teamRecord
    return isEditor
  },
  userIsEditorOfAnyManuscript: async userId => {
    const record = await models.User.relatedQuery('teams')
      .for(userId)
      .findOne(builder =>
        builder
          .where({ role: 'seniorEditor' })
          .orWhere({ role: 'handlingEditor' })
          .orWhere({ role: 'editor' }),
      )
      .select('teams.id')

    const isEditor = !!record
    return isEditor
  },
  defaultIdentityOfUser: async userId => {
    return models.User.relatedQuery('defaultIdentity').for(userId)
  },
  profilePicFileOfUser: async userId => {
    return models.User.relatedQuery('file').for(userId).first()
  },
  // TODO: rename this otherVersionsOfMs
  subVersionsOfMs: async manuscriptId => {
    const thisMs = await models.Manuscript.query()
      .findById(manuscriptId)
      .select('parentId')

    if (!thisMs.parentId)
      return models.Manuscript.relatedQuery('manuscriptVersions')
        .for(manuscriptId)
        .modify('orderByCreatedDesc')

    // The manuscript this request was made for is NOT a first version manuscript.
    // Find all OTHER versions than this one.

    const parent = await models.Manuscript.query().findById(thisMs.parentId)

    const children = await models.Manuscript.relatedQuery('manuscriptVersions')
      .for(parent.id)
      .modify('orderByCreatedDesc')

    return [...children.filter(v => v.id !== manuscriptId), parent]
  },
  teamsForObject: async objectId => {
    return models.Team.query().where({ objectId })
  },
  membersOfTeam: async teamId => {
    return models.Team.relatedQuery('members').for(teamId)
  },
  userForTeamMember: async teamMemberId => {
    return models.TeamMember.relatedQuery('user').for(teamMemberId).first()
  },
  submitterOfMs: async manuscriptId => {
    return models.Manuscript.relatedQuery('submitter').for(manuscriptId).first()
  },
}

const pendingFetchPromises = {}

const fetchMethod = async key => {
  // lru-cache doesn't account for a second identical cache query arriving while the first is still unsettled.
  // The following logic prevents multiple simultaneous duplicate queries.
  const pendingPromise = pendingFetchPromises[key]
  if (pendingPromise) return pendingPromise // Another await on the same promise!

  // eslint-disable-next-line global-require
  if (!models) models = require('@pubsweet/models') // Ensure models are loaded before queries run

  const [queryType, ...params] = key.split(':')
  const queryFunction = queryFunctions[queryType]
  if (!queryFunction)
    throw new Error(`cachedGet called for unknown queryType '${queryType}'`)
  const promise = queryFunction(...params)
  pendingFetchPromises[key] = promise

  try {
    const result = await promise
    return result
  } finally {
    delete pendingFetchPromises[key]
  }
}

/** Get data from cache (if present) or else from DB. The cache evicts items that have remained in it
 * longer than 10 seconds, and also evicts least-recently-used items if maximum size is reached.
 * @param key A string containing the query function name and its parameters, separated by colons
 * e.g. 'userIsGM:ac9da7c9-f8ba-4b2e-9942-a7471adb64c0:b6c1c340-cbaf-4752-938b-2813c1828a06'
 */
const cachedGet = async key => {
  const cachedResult = cache.get(key)
  if (cachedResult !== undefined) return cachedResult

  const fetchResult = await fetchMethod(key)
  cache.set(key, fetchResult)
  return fetchResult
}

const evictFromCache = key => cache.delete(key)

/** Evict all entries from the cache whose keys start with the supplied prefix */
const evictFromCacheByPrefix = keyPrefix => {
  // eslint-disable-next-line no-restricted-syntax
  for (const key of cache.keys())
    if (key.startsWith(keyPrefix)) cache.delete(key)
}

module.exports = { cachedGet, evictFromCache, evictFromCacheByPrefix }
