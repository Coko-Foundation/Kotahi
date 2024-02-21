const createToken = async username => {
  // eslint-disable-next-line global-require
  const { User } = require('@pubsweet/models')

  // eslint-disable-next-line global-require
  const { createJWT } = require('@coko/server')

  const user = await User.query().where({ username }).first()

  if (!user) {
    const users = await User.query().select('username')
    throw new Error(
      `Could not find ${username} among users [${users
        .map(u => `'${u.username}'`)
        .join(', ')}]`,
    )
  }

  const jwt = createJWT(user)

  return jwt
}

module.exports = createToken
