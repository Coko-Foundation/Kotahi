const { logger, fileStorage } = require('@coko/server')
const { AuthorizationError, ConflictError } = require('@coko/server/src/errors')
const { parseISO, addSeconds } = require('date-fns')
const { chunk } = require('lodash')

const Invitation = require('../../../models/invitation/invitation.model')
const Team = require('../../../models/team/team.model')
const TeamMember = require('../../../models/teamMember/teamMember.model')
const Manuscript = require('../../../models/manuscript/manuscript.model')
const Task = require('../../../models/task/task.model')
const TaskEmailNotification = require('../../../models/taskEmailNotification/taskEmailNotification.model')
const User = require('../../../models/user/user.model')
const Channel = require('../../../models/channel/channel.model')
const Identity = require('../../../models/identity/identity.model')

const {
  sendEmailWithPreparedData,
  getGroupAndGlobalRoles,
} = require('./userCommsUtils')

const { cachedGet, evictFromCacheByPrefix } = require('../../querycache')
const Config = require('../../../models/config/config.model')

const addGlobalAndGroupRolesToUserObject = async (ctx, user) => {
  if (!user) return
  const groupId = ctx.req.headers['group-id']
  Object.assign(user, await getGroupAndGlobalRoles(user.id, groupId))
}

const setUserMembershipInTeam = async (ctx, userId, team, shouldBeMember) => {
  if (!team) return // We won't create a new team: this is only intended for existing teams
  evictFromCacheByPrefix('userIs')
  evictFromCacheByPrefix('membersOfTeam')
  const groupId = ctx.req.headers['group-id']
  const teamId = team.id

  if (shouldBeMember) {
    await TeamMember.query()
      .insert({ userId, teamId })
      .whereNotExists(TeamMember.query().where({ userId, teamId }))
  } else {
    await TeamMember.transaction(async trx => {
      if (team.role === 'user') {
        const manuscripts = await Manuscript.query(trx)
          .where({ groupId })
          .withGraphFetched('[teams, invitations, tasks]')

        const manuscriptTeams = manuscripts.flatMap(
          manuscript => manuscript.teams,
        )

        // Remove user from assigned manuscript teams be it author, seniorEditor, handlingEditor, editor, reviewer which are not completed
        await Promise.all(
          manuscriptTeams.map(async manuscriptTeam => {
            const member = await TeamMember.query(trx).findOne({
              userId,
              teamId: manuscriptTeam.id,
            })

            // Skips removing reviewer team members with completed reviews
            if (member && (!member.status || member.status !== 'completed')) {
              await TeamMember.query().deleteById(member.id)
            }
          }),
        )

        const manuscriptInvitations = manuscripts.flatMap(
          manuscript => manuscript.invitations,
        )

        // Remove user UNANSWERED invitations and sent out invitations
        await Promise.all(
          manuscriptInvitations.map(async manuscriptInvitation => {
            const invitation = await Invitation.query(trx).findById(
              manuscriptInvitation.id,
            )

            if (
              invitation.userId === userId &&
              invitation.status === 'UNANSWERED'
            ) {
              await Invitation.query().deleteById(invitation.id)
            } else if (invitation.senderId === userId) {
              // TODO: Fix database validation error sender_id is set not null 1647493905-invitations.sql
              // await Invitation.query(
              //   trx,
              // ).patchAndFetchById(invitation.id, { senderId: null })
            }
          }),
        )

        // Remove user from assignee tasks
        await Task.query(trx)
          .patch({ assigneeUserId: null, assigneeType: null })
          .where({ assigneeUserId: userId, groupId })

        const manuscriptTasks = manuscripts.flatMap(
          manuscript => manuscript.tasks,
        )

        // Remove user from task email notifications
        await Promise.all(
          manuscriptTasks.map(async manuscriptTask => {
            const task = await Task.query(trx).findById(manuscriptTask.id)

            await TaskEmailNotification.query(trx)
              .delete()
              .where({ recipientUserId: userId, taskId: task.id })
          }),
        )

        // Remove user from submitted manuscripts
        await Manuscript.query(trx)
          .update({ submitterId: null })
          .where({ submitterId: userId, groupId })

        await TeamMember.query(trx).delete().where({ userId, teamId })
      } else {
        await TeamMember.query(trx).delete().where({ userId, teamId })
      }
    })
  }
}

const resolvers = {
  Query: {
    async user(_, { id, username }, ctx) {
      if (id) {
        const user = await User.query().findById(id)
        await addGlobalAndGroupRolesToUserObject(ctx, user)
        return user
      }

      if (username) {
        const user = await User.query().findOne({ username })
        await addGlobalAndGroupRolesToUserObject(ctx, user)
        return user
      }

      return null
    },
    async users(_, vars, ctx) {
      return User.query().joinRelated('teams').where({
        role: 'user',
        objectId: ctx.req.headers['group-id'],
      })
    },
    async paginatedUsers(_, { sort, offset, limit }, ctx) {
      const currentUser = await User.query().findById(ctx.userId)
      await addGlobalAndGroupRolesToUserObject(ctx, currentUser)

      let query

      if (currentUser.globalRoles.includes('admin')) {
        query = User.query()
      } else {
        query = User.query().joinRelated('teams').where({
          role: 'user',
          objectId: ctx.req.headers['group-id'],
        })
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

      // eslint-disable-next-line no-restricted-syntax
      for (const someUsers of chunk(users, 10)) {
        // eslint-disable-next-line no-await-in-loop
        await Promise.all(
          someUsers.map(async user =>
            addGlobalAndGroupRolesToUserObject(ctx, user),
          ),
        )
      }

      return {
        totalCount,
        users,
      }
    },
    channelUsersForMention: async (_, { channelId }, ctx) => {
      if (!channelId) {
        throw new Error('Channel ID is required.')
      }

      const channelWithUsers = await Channel.query()
        .findById(channelId)
        .withGraphFetched('users(orderByUsername)')

      if (!channelWithUsers) {
        throw new Error('Channel not found.')
      }

      const activeConfig = await Config.getCached(channelWithUsers.groupId)

      const reviewerTeam = await Team.query()
        .findOne({ objectId: channelWithUsers.manuscriptId, role: 'reviewer' })
        .withGraphFetched('members')

      const hideFromReviewers =
        activeConfig.formData.discussionChannel?.hideDiscussionFromReviewers

      let result = [...channelWithUsers.users]

      if (hideFromReviewers && reviewerTeam) {
        const memberUserIds = reviewerTeam.members.map(member => member.userId)

        result = result.filter(
          chatMember => !memberUserIds.includes(chatMember.id),
        )
      }

      if (channelWithUsers.type !== 'all') {
        const groupId = ctx.req.headers['group-id']

        const groupManagers = await Team.relatedQuery('users')
          .for(
            Team.query().where({
              role: 'groupManager',
              objectId: groupId,
              objectType: 'Group',
            }),
          )
          .whereNotIn(
            'users.id',
            result.map(user => user.id),
          )
          .modify('orderByUsername')

        result.push(...groupManagers)
      }

      return result
    },

    // Authentication
    async currentUser(_, vars, ctx) {
      if (!ctx.userId) return null

      const user = await User.query().patchAndFetchById(ctx.userId, {
        lastOnline: new Date(Date.now()),
      })

      if (!user) return null
      await addGlobalAndGroupRolesToUserObject(ctx, user)
      return user
    },
    searchUsers(_, { teamId, query }, ctx) {
      if (teamId) {
        return User.model
          .query()
          .where({ teamId })
          .where('username', 'ilike', `${query}%`)
      }

      return User.model.query().where('username', 'ilike', `${query}%`)
    },
  },
  Mutation: {
    async createUser(_, { input }, ctx) {
      const user = {
        username: input.username,
        email: input.email,
        passwordHash: await User.hashPassword(input.password),
      }

      const identity = {
        type: 'local',
        aff: input.aff,
        name: input.name,
        isDefault: true,
      }

      user.defaultIdentity = identity

      try {
        const result = await User.create(user, ctx, {
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
      return User.transaction(async trx => {
        const user = await User.query(trx).findById(id)
        await Manuscript.query(trx)
          .update({ submitterId: null })
          .where({ submitterId: id })
        await Invitation.query(trx).where({ userId: id }).delete()
        // TODO: Fix database validation error sender_id is set not null 1647493905-invitations.sql
        await Invitation.query(trx)
          .update({ senderId: null })
          .where({ senderId: id })
        await User.query(trx).where({ id }).delete()
        // eslint-disable-next-line no-console
        console.info(`User ${id} (${user.username}) deleted.`)
        return user
      })
    },
    async updateUser(_, { id, input }, ctx) {
      if (input.password) {
        // eslint-disable-next-line no-param-reassign
        input.passwordHash = await User.hashPassword(input.password)
        // eslint-disable-next-line no-param-reassign
        delete input.password
      }

      const updatedUser = JSON.parse(input)
      delete updatedUser.globalRoles
      delete updatedUser.groupRoles
      return User.query().updateAndFetchById(id, updatedUser)
    },
    async setGlobalRole(_, { userId, role, shouldEnable }, ctx) {
      const team = await Team.query().findOne({ role, global: true })
      await setUserMembershipInTeam(ctx, userId, team, shouldEnable)
      const user = await User.findById(userId)
      await addGlobalAndGroupRolesToUserObject(ctx, user)
      delete user.updated
      return user
    },
    async setGroupRole(_, { userId, role, shouldEnable }, ctx) {
      const groupId = ctx.req.headers['group-id']

      const team = await Team.query().findOne({
        role,
        objectId: groupId,
      })

      await setUserMembershipInTeam(ctx, userId, team, shouldEnable)
      const user = await User.findById(userId)
      await addGlobalAndGroupRolesToUserObject(ctx, user)
      delete user.updated
      return user
    },
    // Authentication
    async loginUser(_, { input }, ctx) {
      /* eslint-disable-next-line global-require */
      const { createJWT } = require('@coko/server')

      let isValid = false
      let user

      try {
        user = await User.query.findOne({ username: input.username })
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
    async updateUsername(_, { id, username }, ctx) {
      return User.query().patchAndFetchById(id, { username })
    },
    async updateLanguage(_, { id, preferredLanguage }, ctx) {
      return User.query().patchAndFetchById(id, { preferredLanguage })
    },
    async updateEmail(_, { id, email }, ctx) {
      const user = await User.findById(id)

      if (user.email === email) {
        return { success: true }
      }

      const emailValidationRegexp =
        /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i

      const emailValidationResult = emailValidationRegexp.test(email)

      if (!emailValidationResult) {
        return { success: false, error: 'invalidEmail' }
      }

      const userWithSuchEmail = await User.query().findOne({ email })

      if (userWithSuchEmail) {
        return { success: false, error: 'emailTaken' }
      }

      try {
        const updatedUser = await User.query().updateAndFetchById(id, {
          email,
        })

        return { success: true, user: updatedUser }
      } catch (e) {
        return { success: false, error: 'smthWentWrong', user: null }
      }
    },
    async updateRecentTab(_, { tab }, ctx) {
      const user = await User.query().updateAndFetchById(ctx.userId, {
        recentTab: tab,
      })

      return user
    },
    async sendEmail(_, { input }, ctx) {
      try {
        const result = await sendEmailWithPreparedData(input, ctx)
        return {
          invitation: result,
          response: {
            success: result.success,
          },
        }
      } catch (error) {
        // Return SendEmailPayload object with success=false and error message
        return {
          invitation: null,
          response: {
            success: false,
            errorMessage: error.message,
          },
        }
      }
    },
    async expandChat(_, { state }, ctx) {
      const user = await User.query().updateAndFetchById(ctx.userId, {
        chatExpanded: state,
      })

      return user
    },
    async updateMenuUI(_, { expanded }, ctx) {
      const user = await User.query().updateAndFetchById(ctx.userId, {
        menuPinned: expanded,
      })

      return user
    },
  },
  User: {
    async isOnline(parent) {
      const currentDateTime = new Date()
      return (
        parent.lastOnline && currentDateTime - parent.lastOnline < 5 * 60 * 1000
      )
    },
    async defaultIdentity(parent, args, ctx) {
      const userId = parent.id
      return cachedGet(`defaultIdentityOfUser:${userId}`)
    },
    async identities(parent, args, ctx) {
      const identities = await Identity.query().where({
        userId: parent.id,
      })

      return identities
    },
    async profilePicture(parent, args, ctx) {
      let { id: userId, profilePicture } = parent
      const file = await cachedGet(`profilePicFileOfUser:${userId}`)

      if (file) {
        const params = new Proxy(new URLSearchParams(profilePicture), {
          get: (searchParams, prop) => searchParams.get(prop),
        })

        const creationDate = parseISO(params['X-Amz-Date'])
        const expiresInSecs = Number(params['X-Amz-Expires'])

        const expiryDate = addSeconds(creationDate, expiresInSecs)
        const isExpired = expiryDate < new Date()

        // Re-generate URL only if the previous generated URL expired
        if (isExpired) {
          const objectKey = file.storedObjects.find(
            storedObject => storedObject.type === 'small',
          ).key

          profilePicture = await fileStorage.getURL(objectKey)

          await User.query().patchAndFetchById(userId, {
            profilePicture,
          })
        }

        return profilePicture
      }

      const avatarPlaceholder = '/profiles/default_avatar.svg'

      if (profilePicture !== avatarPlaceholder) {
        profilePicture = avatarPlaceholder
        await User.query().patchAndFetchById(userId, { profilePicture })
      }

      return profilePicture
    },
  },
}

const typeDefs = `
  extend type Query {
    user(id: ID, username: String): User
    users: [User]
    paginatedUsers(sort: UsersSort, offset: Int, limit: Int): PaginatedUsers
    searchUsers(teamId: ID, query: String): [User]
    channelUsersForMention(channelId: ID!): [User]
  }

  type PaginatedUsers {
    totalCount: Int
    users: [User]
  }

  type SendEmailResponse {
    success: Boolean!
    errorMessage: String
  }

  type SendEmailPayload {
    invitation: Invitation
    response: SendEmailResponse!
  }

  extend type Mutation {
    createUser(input: UserInput): User
    deleteUser(id: ID): User
    updateUser(id: ID, input: String): User
    updateUsername(id: ID!, username: String!): User
    updateLanguage(id: ID!, preferredLanguage: String!): User
    sendEmail(input: String!): SendEmailPayload!
    updateEmail(id: ID!, email: String!): UpdateEmailResponse
    updateRecentTab(tab: String): User
    updateMenuUI(expanded: Boolean!): User!
    setGlobalRole(userId: ID!, role: String!, shouldEnable: Boolean!): User!
    setGroupRole(userId: ID!, role: String!, shouldEnable: Boolean!): User!
    expandChat(state: Boolean!): User!
  }

  type UpdateEmailResponse {
    success: Boolean
    error: String
    user: User
  }

  enum UsersSort {
    username_ASC
    username_DESC
    email_ASC
    email_DESC
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
    groupRoles: [String]
    globalRoles: [String]
    preferredLanguage: String
    identities: [Identity]
    defaultIdentity: Identity
    file: File
    profilePicture: String
    online: Boolean
    lastOnline: DateTime
    isOnline: Boolean
    recentTab: String
    chatExpanded: Boolean!
    menuPinned: Boolean!
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
    globalRoles: [String!]
    groupRoles: [String!]
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
