const { logger, fileStorage } = require('@coko/server')
const { AuthorizationError, ConflictError } = require('@pubsweet/errors')
const { parseISO, addSeconds } = require('date-fns')
const models = require('@pubsweet/models')

const { sendEmailWithPreparedData } = require('./userCommsUtils')

const resolvers = {
  Query: {
    user(_, { id, username }, ctx) {
      if (id) {
        return models.User.query().findById(id)
      }

      if (username) {
        return models.User.query().where({ username }).first()
      }

      return null
    },
    async users(_, vars, ctx) {
      return models.User.query()
    },
    async paginatedUsers(_, { sort, offset, limit, filter }, ctx) {
      const query = models.User.query()

      if (filter && filter.admin) {
        query.where({ admin: true })
      }

      const totalCount = await query.resultSize()

      if (sort) {
        // e.g. 'created_DESC' into 'created' and 'DESC' arguments
        const [fieldName, direction] = sort.split('_')

        if (fieldName === 'lastOnline') {
          query.orderByRaw(
            `(last_online IS NULL) ${direction === 'DESC' ? 'ASC' : 'DESC'}`,
          )
        }

        query.orderBy(fieldName, direction)
      }

      if (limit) {
        query.limit(limit)
      }

      if (offset) {
        query.offset(offset)
      }

      const users = await query
      return {
        totalCount,
        users,
      }
    },
    // Authentication
    async currentUser(_, vars, ctx) {
      if (!ctx.user) return null

      const user = await models.User.query().patchAndFetchById(ctx.user, {
        lastOnline: new Date(Date.now()),
      })

      // eslint-disable-next-line no-underscore-dangle
      user._currentRoles = await user.currentRoles()
      return user
    },
    searchUsers(_, { teamId, query }, ctx) {
      if (teamId) {
        return models.User.model
          .query()
          .where({ teamId })
          .where('username', 'ilike', `${query}%`)
      }

      return models.User.model.query().where('username', 'ilike', `${query}%`)
    },
  },
  Mutation: {
    async createUser(_, { input }, ctx) {
      const user = {
        username: input.username,
        email: input.email,
        passwordHash: await models.User.hashPassword(input.password),
      }

      const identity = {
        type: 'local',
        aff: input.aff,
        name: input.name,
        isDefault: true,
      }

      user.defaultIdentity = identity

      try {
        const result = await models.User.create(user, ctx, {
          eager: 'defaultIdentity',
        })

        return result
      } catch (e) {
        if (e.constraint) {
          throw new ConflictError(
            'User with this username or email already exists',
          )
        } else {
          throw e
        }
      }
    },
    async deleteUser(_, { id }, ctx) {
      const user = await models.User.query().findById(id)
      await models.Manuscript.query()
        .update({ submitterId: null })
        .where({ submitterId: id })

      await models.User.query().where({ id }).delete()
      return user
    },
    async updateUser(_, { id, input }, ctx) {
      if (input.password) {
        // eslint-disable-next-line no-param-reassign
        input.passwordHash = await models.User.hashPassword(input.password)
        // eslint-disable-next-line no-param-reassign
        delete input.password
      }

      return models.User.query().updateAndFetchById(id, JSON.parse(input))
    },

    // Authentication
    async loginUser(_, { input }, ctx) {
      /* eslint-disable-next-line global-require */
      const { createJWT } = require('@coko/server')

      let isValid = false
      let user

      try {
        user = await models.User.findByUsername(input.username)
        isValid = await user.validPassword(input.password)
      } catch (err) {
        logger.debug(err)
      }

      if (!isValid) {
        throw new AuthorizationError('Wrong username or password.')
      }

      return {
        user,
        token: createJWT(user),
      }
    },
    async updateCurrentUsername(_, { username }, ctx) {
      const user = await models.User.find(ctx.user)
      user.username = username
      await user.save()
      return user
    },
    async updateCurrentEmail(_, { email }, ctx) {
      const ctxUser = await models.User.find(ctx.user)

      if (ctxUser.email === email) {
        return { success: true }
      }

      const emailValidationRegexp = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i
      const emailValidationResult = emailValidationRegexp.test(email)

      if (!emailValidationResult) {
        return { success: false, error: 'Email is invalid' }
      }

      const userWithSuchEmail = await models.User.query().where({ email })

      if (userWithSuchEmail[0]) {
        return { success: false, error: 'Email is already taken' }
      }

      try {
        const user = await models.User.query().updateAndFetchById(ctx.user, {
          email,
        })

        return { success: true, user }
      } catch (e) {
        return { success: false, error: 'Something went wrong', user: null }
      }
    },
    async updateRecentTab(_, { tab }, ctx) {
      const user = await models.User.query().updateAndFetchById(ctx.user, {
        recentTab: tab,
      })

      return user
    },
    async sendEmail(_, { input }, ctx) {
      const result = await sendEmailWithPreparedData(input, ctx)

      return result
    },
  },
  User: {
    isOnline: user => user.isOnline(),
    async defaultIdentity(parent, args, ctx) {
      const identity = await models.Identity.query()
        .where({ userId: parent.id, isDefault: true })
        .first()

      return identity
    },
    async identities(parent, args, ctx) {
      const identities = await models.Identity.query().where({
        userId: parent.id,
      })

      return identities
    },
    async profilePicture(parent, args, ctx) {
      const user = await models.User.query()
        .findById(parent.id)
        .withGraphFetched('[file]')

      const avatarPlaceholder = '/profiles/default_avatar.svg'

      if (user.file) {
        const params = new Proxy(new URLSearchParams(user.profilePicture), {
          get: (searchParams, prop) => searchParams.get(prop),
        })

        const creationDate = parseISO(params['X-Amz-Date'])
        const expiresInSecs = Number(params['X-Amz-Expires'])

        const expiryDate = addSeconds(creationDate, expiresInSecs)
        const isExpired = expiryDate < new Date()

        // Re-generate URL only if the previous generated URL expired
        if (isExpired) {
          const objectKey = user.file.storedObjects.find(
            storedObject => storedObject.type === 'small',
          ).key

          user.profilePicture = await fileStorage.getURL(objectKey)
          await user.save()
        }
      } else if (user.profilePicture !== avatarPlaceholder) {
        user.profilePicture = avatarPlaceholder
        await user.save()
      }

      return user.profilePicture
    },
  },
}

const typeDefs = `
  extend type Query {
    user(id: ID, username: String): User
    users: [User]
    paginatedUsers(sort: UsersSort, offset: Int, limit: Int, filter: UsersFilter): PaginatedUsers
    searchUsers(teamId: ID, query: String): [User]
  }

  type PaginatedUsers {
    totalCount: Int
    users: [User]
  }

  extend type Mutation {
    createUser(input: UserInput): User
    deleteUser(id: ID): User
    updateUser(id: ID, input: String): User
    updateCurrentUsername(username: String): User
    sendEmail(input: String): Invitation
    updateCurrentEmail(email: String): UpdateEmailResponse
    updateRecentTab(tab: String): User
  }

  type UpdateEmailResponse {
    success: Boolean
    error: String
    user: User
  }

  input UsersFilter {
    admin: Boolean
  }

  enum UsersSort {
    username_ASC
    username_DESC
    email_ASC
    email_DESC
    admin_ASC
    admin_DESC
    created_ASC
    created_DESC
    lastOnline_ASC
    lastOnline_DESC
  }

  type User {
    id: ID!
    created: DateTime!
    updated: DateTime
    username: String
    email: String
    admin: Boolean
    identities: [Identity]
    defaultIdentity: Identity
    file: File
    profilePicture: String
    online: Boolean
    lastOnline: DateTime
    isOnline: Boolean
    recentTab: String
    _currentRoles: [CurrentRole]
    _currentGlobalRoles: [String]
  }

  type CurrentRole {
    id: ID
    roles: [String]
  }

  type Identity {
    id: ID
    name: String
    aff: String # JATS <aff>
    email: String # JATS <aff>
    type: String
    identifier: String
  }

  input UserInput {
    username: String!
    email: String!
    password: String
    rev: String
    admin: Boolean
  }

  # Authentication

  extend type Query {
    # Get the currently authenticated user based on the JWT in the HTTP headers
    currentUser: User
  }

  extend type Mutation {
    # Authenticate a user using username and password
    loginUser(input: LoginUserInput): LoginResult
  }

  # User details and bearer token
  type LoginResult {
    user: User!
    token: String!
  }

  input LoginUserInput {
    username: String!
    password: String!
  }

  # Common types
  scalar DateTime
`

module.exports = { resolvers, typeDefs }
