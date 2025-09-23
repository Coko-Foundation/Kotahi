const User = require('./user.model')

const defaultIdentitiesLoader = async userIds => {
  const users = await User.query()
    .whereIn('id', userIds)
    .withGraphFetched('defaultIdentity')

  const map = new Map(users.map(u => [u.id, u.defaultIdentity || null]))

  return userIds.map(id => map.get(id) ?? null)
}

module.exports = {
  defaultIdentitiesLoader,
}
