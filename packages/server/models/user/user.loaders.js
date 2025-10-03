const User = require('./user.model')

const defaultIdentitiesLoader = async userIds => {
  const identities = await User.relatedQuery('defaultIdentity').for(userIds)

  const map = new Map(identities.map(i => [i.userId, i]))

  return userIds.map(id => map.get(id) ?? null)
}

module.exports = {
  defaultIdentitiesLoader,
}
