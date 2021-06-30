const logger = require('@pubsweet/logger')
const { AuthorizationError, ConflictError } = require('@pubsweet/errors')
const { existsSync } = require('fs')
const path = require('path')

const resolvers = {
  Query: {
    user(_, { id, username }, ctx) {
      if (id) {
        return ctx.models.User.query().findById(id)
      }

      if (username) {
        return ctx.models.User.query().where({ username }).first()
      }

      return null
    },
    async users(_, vars, ctx) {
      return ctx.models.User.query()
    },
    async paginatedUsers(_, { sort, offset, limit, filter }, ctx) {
      const query = ctx.models.User.query()

      if (filter && filter.admin) {
        query.where({ admin: true })
      }

      const totalCount = await query.resultSize()

      if (sort) {
        // e.g. 'created_DESC' into 'created' and 'DESC' arguments
        query.orderBy(...sort.split('_'))
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

      // return ctx.models.User.fetchAll(where, ctx, { eager })
    },
    // Authentication
    async currentUser(_, vars, ctx) {
      if (!ctx.user) return null
      const avatarPlaceholder = '/static/profiles/default_avatar.svg'
      const user = await ctx.models.User.find(ctx.user.id)
      const profilePicture = user.profilePicture ? user.profilePicture : ''

      const profilePicturePath = path.join(
        __dirname,
        '../../..',
        profilePicture.replace('/static/', ''),
      )

      if (
        profilePicture !== avatarPlaceholder &&
        !existsSync(profilePicturePath)
      ) {
        await ctx.models.User.query()
          .update({ profilePicture: avatarPlaceholder })
          .where('id', user.id)
        user.profilePicture = avatarPlaceholder
      }

      // eslint-disable-next-line no-underscore-dangle
      user._currentRoles = await user.currentRoles()
      return user
    },
    searchUsers(_, { teamId, query }, ctx) {
      if (teamId) {
        return ctx.models.User.model
          .query()
          .where({ teamId })
          .where('username', 'ilike', `${query}%`)
      }

      return ctx.models.User.model
        .query()
        .where('username', 'ilike', `${query}%`)
    },
  },
  Mutation: {
    async createUser(_, { input }, ctx) {
      const user = {
        username: input.username,
        email: input.email,
        passwordHash: await ctx.models.User.hashPassword(input.password),
      }

      const identity = {
        type: 'local',
        aff: input.aff,
        name: input.name,
        isDefault: true,
      }

      user.defaultIdentity = identity

      try {
        const result = await ctx.models.User.create(user, ctx, {
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
    deleteUser(_, { id }, ctx) {
      return ctx.models.User.query().delete(id, ctx)
    },
    async updateUser(_, { id, input }, ctx) {
      if (input.password) {
        // eslint-disable-next-line no-param-reassign
        input.passwordHash = await ctx.models.User.hashPassword(input.password)
        // eslint-disable-next-line no-param-reassign
        delete input.password
      }

      return ctx.models.User.query().updateAndFetchById(id, JSON.parse(input))
    },
    // Authentication
    async loginUser(_, { input }, ctx) {
      /* eslint-disable-next-line global-require */
      const authentication = require('pubsweet-server/src/authentication')

      let isValid = false
      let user

      try {
        user = await ctx.models.User.findByUsername(input.username)
        isValid = await user.validPassword(input.password)
      } catch (err) {
        logger.debug(err)
      }

      if (!isValid) {
        throw new AuthorizationError('Wrong username or password.')
      }

      return {
        user,
        token: authentication.token.create(user),
      }
    },
    async updateCurrentUsername(_, { username }, ctx) {
      const user = await ctx.models.User.find(ctx.user)
      user.username = username
      await user.save()
      return user
    },
  },
  User: {
    async defaultIdentity(parent, args, ctx) {
      const identity = await ctx.models.Identity.query()
        .where({ userId: parent.id, isDefault: true })
        .first()

      return identity
    },
    async identities(parent, args, ctx) {
      const identities = await ctx.models.Identity.query().where({
        userId: parent.id,
      })

      return identities
    },
  },
  // LocalIdentity: {
  //   __isTypeOf: (obj, context, info) => obj.type === 'local',
  //   async email(obj, args, ctx, info) {
  //     // Emails stored on user, but surfaced in local identity too
  //     return (await ctx.loaders.User.load(obj.userId)).email
  //   },
  // },
  // ExternalIdentity: {
  //   __isTypeOf: (obj, context, info) => obj.type !== 'local',
  // },
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
    profilePicture: String
    online: Boolean
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

  # union Identity = Local | External

  # local identity (not from ORCID, etc.)
  #type LocalIdentity implements Identity {
  #  id: ID
  #  name: String
  #  email: String
  #  aff: String
  #  type: String
  #}
  #
  #type ExternalIdentity implements Identity {
  #  id: ID
  #  name: String
  #  identifier: String
  #  email: String
  #  aff: String
  #  type: String
  #}

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

  interface Object {
    id: ID!
    created: DateTime!
    updated: DateTime
  }

`

module.exports = { resolvers, typeDefs }
