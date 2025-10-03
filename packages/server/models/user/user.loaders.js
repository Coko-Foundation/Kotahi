const User = require('./user.model')

const defaultIdentitiesLoader = async userIds => {
  const identities = await User.relatedQuery('defaultIdentity').for(userIds)

  // reduce into a map, keeping the first seen per userId
  const grouped = identities.reduce((acc, identity) => {
    if (!acc.has(identity.userId)) {
      acc.set(identity.userId, identity)
    }

    return acc
  }, new Map())

  return userIds.map(id => grouped.get(id) ?? null)
}

module.exports = {
  defaultIdentitiesLoader,
}
