const models = require('@pubsweet/models')
const { useTransaction, logger } = require('@coko/server')

const {
  updateAlertsUponTeamUpdate,
} = require('../../model-task/src/taskCommsUtils')

const {
  addUserToManuscriptChatChannel,
  removeUserFromManuscriptChatChannel,
} = require('../../model-channel/src/channelCommsUtils')

const { evictFromCacheByPrefix, cachedGet } = require('../../querycache')

const {
  sendEmailWithPreparedData,
} = require('../../model-user/src/userCommsUtils')

const resolvers = {
  Query: {
    team(_, { id }, ctx) {
      return models.Team.query().findById(id)
    },
    teams(_, { where }, ctx) {
      return models.Team.query().where(where || {})
    },
  },
  Mutation: {
    async deleteTeam(_, { id }, ctx) {
      evictFromCacheByPrefix('userIs')
      return models.Team.query().deleteById(id)
    },
    async createTeam(_, { input }, ctx) {
      // TODO Only the relate option appears to be used by insertGraphAndFetch, according to Objection docs?
      const options = {
        relate: ['members.user'],
        unrelate: ['members.user'],
        allowUpsert: '[members, members.alias]',
        eager: '[members.[user.teams, alias]]',
      }

      await Promise.all(
        input.members.map(async member => {
          await addUserToManuscriptChatChannel({
            manuscriptId: input.objectId,
            userId: member.user.id,
            type: 'all',
          })
          await addUserToManuscriptChatChannel({
            manuscriptId: input.objectId,
            userId: member.user.id,
            type: 'editorial',
          })
        }),
      )

      return models.Team.query().insertGraphAndFetch(input, options)
    },
    async updateTeam(_, { id, input }, ctx) {
      evictFromCacheByPrefix('userIs')
      evictFromCacheByPrefix('membersOfTeam')
      const existing = await models.Team.query().select('role').findById(id)

      if (
        existing &&
        ['editor', 'handlingEditor', 'seniorEditor'].includes(existing.role)
      ) {
        const existingMemberIds = (
          await models.TeamMember.query().select('userId').where({ teamId: id })
        ).map(m => m.userId)

        const newMemberIds = input.members.map(m => m.user.id)

        const membersAdded = newMemberIds.filter(
          userId => !existingMemberIds.includes(userId),
        )

        const membersRemoved = existingMemberIds.filter(
          userId => !newMemberIds.includes(userId),
        )

        const { objectId } = await models.Team.query()
          .select('objectId')
          .findById(id)

        await updateAlertsUponTeamUpdate(objectId, membersAdded, membersRemoved)

        const channels = await models.Manuscript.relatedQuery('channels').for(
          objectId,
        )

        await Promise.all(
          membersRemoved.map(async userId => {
            // Check if the user has any messages in the channels before removing them from the channelMember
            const hasPostedToChannel = await models.Message.query()
              .where({ userId })
              .whereIn(
                'channelId',
                channels.map(channel => channel.id),
              )
              .first()

            if (!hasPostedToChannel) {
              await removeUserFromManuscriptChatChannel({
                manuscriptId: objectId,
                userId,
                type: 'all',
              })
              await removeUserFromManuscriptChatChannel({
                manuscriptId: objectId,
                userId,
                type: 'editorial',
              })
              const pathStrings = channels.map(channel => `chat/${channel.id}`)
              await models.NotificationDigest.query()
                .delete()
                .where({ user_id: userId })
                .whereIn('path_string', pathStrings)
            }
          }),
        )

        await Promise.all(
          input.members.map(async member => {
            await addUserToManuscriptChatChannel({
              manuscriptId: objectId,
              userId: member.user.id,
              type: 'all',
            })
            await addUserToManuscriptChatChannel({
              manuscriptId: objectId,
              userId: member.user.id,
              type: 'editorial',
            })
          }),
        )
      }

      return models.Team.query().upsertGraphAndFetch(
        { id, ...input },
        {
          relate: ['members.user'],
          unrelate: ['members.user'],
          eager: 'members.user.teams', // TODO This appears to be ignored, according to Objection documentation?
        },
      )
    },
    async updateTeamMember(_, { id, input }, ctx) {
      return useTransaction(async trx => {
        const updatedTeamMember = await models.TeamMember.query(
          trx,
        ).updateAndFetchById(id, JSON.parse(input))

        const collaboratorTeam = await models.Team.query(trx).findById(
          updatedTeamMember.teamId,
        )

        if (collaboratorTeam.role === 'collaborator') {
          const manuscript = await models.Manuscript.query(trx)
            .findById(collaboratorTeam.objectId)
            .withGraphJoined('[teams.members.user.defaultIdentity, channels]')

          const activeConfig = await models.Config.getCached(manuscript.groupId)
          const author = await models.User.query(trx).findById(ctx.user)

          const collaborator = manuscript.teams
            .find(t => t.id === collaboratorTeam.id)
            ?.members.find(m => m.id === id)?.user

          const selectedEmail = collaborator?.email
          const receiverName = collaborator?.username

          const selectedTemplate =
            activeConfig.formData.eventNotification
              ?.collaboratorAccessChangeEmailTemplate

          const emailValidationRegexp = /^[^\s@]+@[^\s@]+$/

          const emailValidationResult =
            selectedEmail && emailValidationRegexp.test(selectedEmail)

          const teamMemberStatus = updatedTeamMember.status

          if (!emailValidationResult || !receiverName) {
            return updatedTeamMember
          }

          if (selectedTemplate) {
            const notificationInput = {
              manuscript,
              selectedEmail,
              selectedTemplate,
              currentUser: author?.username || '',
              groupId: manuscript.groupId,
              teamMemberStatus,
            }

            try {
              await sendEmailWithPreparedData(notificationInput, ctx, author, {
                trx,
              })

              let channelId

              if (manuscript.parentId) {
                const channel = await models.Manuscript.relatedQuery('channels')
                  .for(manuscript.parentId)
                  .findOne({ topic: 'Manuscript discussion' })

                channelId = channel.id
              } else {
                channelId = manuscript.channels.find(
                  channel => channel.topic === 'Manuscript discussion',
                ).id
              }

              models.Message.createMessage({
                content: `Article access changed to "can  ${
                  teamMemberStatus === 'read' ? 'view' : 'edit'
                }" Email sent by Kotahi to ${receiverName}`,
                channelId,
                userId: collaborator.id,
              })
            } catch (e) {
              logger.error('updateTeamMember email was not sent', e)
            }
          }
        }

        return updatedTeamMember
      })
    },
    async addTeamMembers(_, { teamId, members, status }, ctx) {
      return useTransaction(async trx => {
        const newTeamMembers = await Promise.all(
          members.map(userId =>
            models.TeamMember.query(trx).insert({ teamId, userId, status }),
          ),
        )

        const collaboratorTeam = await models.Team.query(trx).findById(teamId)

        if (collaboratorTeam.role === 'collaborator') {
          const manuscript = await models.Manuscript.query(trx)
            .findById(collaboratorTeam.objectId)
            .withGraphJoined('[teams.members.user.defaultIdentity, channels]')

          const activeConfig = await models.Config.getCached(manuscript.groupId)
          const author = await models.User.query(trx).findById(ctx.user)

          const collaborators = manuscript.teams
            .find(t => t.id === collaboratorTeam.id)
            ?.members.filter(m =>
              newTeamMembers.map(tm => tm.id).includes(m.id),
            )
            .map(member => member.user)

          await Promise.all(
            collaborators.map(async collaborator => {
              const selectedEmail = collaborator?.email
              const receiverName = collaborator?.username

              const selectedTemplate =
                activeConfig.formData.eventNotification
                  ?.collaboratorAccessGrantedEmailTemplate

              const emailValidationRegexp = /^[^\s@]+@[^\s@]+$/

              const emailValidationResult =
                selectedEmail && emailValidationRegexp.test(selectedEmail)

              const teamMemberStatus = status

              if (!emailValidationResult || !receiverName) {
                return
              }

              if (selectedTemplate) {
                const notificationInput = {
                  manuscript,
                  selectedEmail,
                  selectedTemplate,
                  currentUser: author?.username || '',
                  groupId: manuscript.groupId,
                  teamMemberStatus,
                }

                try {
                  await sendEmailWithPreparedData(
                    notificationInput,
                    ctx,
                    author,
                    { trx },
                  )

                  let channelId

                  if (manuscript.parentId) {
                    const channel = await models.Manuscript.relatedQuery(
                      'channels',
                    )
                      .for(manuscript.parentId)
                      .findOne({ topic: 'Manuscript discussion' })

                    channelId = channel.id
                  } else {
                    channelId = manuscript.channels.find(
                      channel => channel.topic === 'Manuscript discussion',
                    ).id
                  }

                  models.Message.createMessage({
                    content: `Article access granted as "can  ${
                      teamMemberStatus === 'read' ? 'view' : 'edit'
                    }" Email sent by Kotahi to ${receiverName}`,
                    channelId,
                    userId: collaborator.id,
                  })
                } catch (e) {
                  logger.error('addTeamMember email was not sent', e)
                }
              }
            }),
          )
        }

        return collaboratorTeam
      })
    },
    async removeTeamMember(_, { teamId, userId }, ctx) {
      return useTransaction(async trx => {
        const teamMemberToDelete = await models.TeamMember.query(trx).findOne({
          teamId,
          userId,
        })

        await models.TeamMember.query(trx)
          .delete()
          .where({ id: teamMemberToDelete.id })

        const collaboratorTeam = await models.Team.query(trx).findById(teamId)

        if (collaboratorTeam.role === 'collaborator') {
          const manuscript = await models.Manuscript.query(trx)
            .findById(collaboratorTeam.objectId)
            .withGraphJoined('[teams.members.user.defaultIdentity, channels]')

          const activeConfig = await models.Config.getCached(manuscript.groupId)
          const author = await models.User.query(trx).findById(ctx.user)

          const collaborator = await models.User.query(trx).findById(userId)

          const selectedEmail = collaborator?.email
          const receiverName = collaborator?.username

          const selectedTemplate =
            activeConfig.formData.eventNotification
              ?.collaboratorAccessRemovedEmailTemplate

          const emailValidationRegexp = /^[^\s@]+@[^\s@]+$/

          const emailValidationResult =
            selectedEmail && emailValidationRegexp.test(selectedEmail)

          if (!emailValidationResult || !receiverName) {
            return teamMemberToDelete
          }

          if (selectedTemplate) {
            const notificationInput = {
              manuscript,
              selectedEmail,
              selectedTemplate,
              currentUser: author?.username || '',
              groupId: manuscript.groupId,
            }

            try {
              await sendEmailWithPreparedData(notificationInput, ctx, author, {
                trx,
              })

              let channelId

              if (manuscript.parentId) {
                const channel = await models.Manuscript.relatedQuery('channels')
                  .for(manuscript.parentId)
                  .findOne({ topic: 'Manuscript discussion' })

                channelId = channel.id
              } else {
                channelId = manuscript.channels.find(
                  channel => channel.topic === 'Manuscript discussion',
                ).id
              }

              models.Message.createMessage({
                content: `Article access removed Email sent by Kotahi to ${receiverName}`,
                channelId,
                userId: collaborator.id,
              })
            } catch (e) {
              logger.error('removeTeamMember email was not sent', e)
            }
          }
        }

        return teamMemberToDelete
      })
    },
  },
  User: {
    teams: (parent, _, ctx) => models.User.relatedQuery('teams').for(parent.id),
  },
  Team: {
    async members(team, { where }, ctx) {
      return team.members ?? cachedGet(`membersOfTeam:${team.id}`)
    },
    object(team, vars, ctx) {
      const { objectId, objectType } = team
      return objectId && objectType ? { objectId, objectType } : null
    },
  },
  TeamMember: {
    async user(teamMember, vars, ctx) {
      return teamMember.user ?? cachedGet(`userForTeamMember:${teamMember.id}`)
    },
    async alias(teamMember, vars, ctx) {
      const member = await models.TeamMember.query().findById(teamMember.id)
      return member ? member.$relatedQuery('alias') : null
    },
  },
}

const typeDefs = `
  extend type Query {
    team(id: ID): Team
    teams(where: TeamWhereInput): [Team]
  }

  extend type Mutation {
    createTeam(input: TeamInput): Team
    deleteTeam(id: ID): Team
    updateTeam(id: ID, input: TeamInput): Team
    updateTeamMember(id: ID!, input: String): TeamMember
	addTeamMembers(teamId: ID!, members: [ID!]!, status: String): Team!
	removeTeamMember(teamId: ID!, userId: ID!): TeamMember!
  }

  extend type User {
    teams: [Team]
  }

  type Team {
    id: ID!
    type: String!
    role: String!
    name: String
    object: TeamObject
    objectId: ID
    objectType: String
    members: [TeamMember!]
    owners: [User]
    global: Boolean
    created: DateTime
    updated: DateTime
  }

  input TeamMemberInput {
    id: ID
    user: TeamMemberUserInput
    alias: AliasInput
    status: String
    isShared: Boolean
  }

  input TeamMemberUserInput {
    id: ID!
  }

  type TeamMember {
    id: ID
    user: User
    status: String
    alias: Alias
    isShared: Boolean
    created: DateTime
    updated: DateTime
  }

  type Alias {
    name: String
    email: String
    aff: String
  }

  input AliasInput {
    name: String
    email: String
    aff: String
  }

  type TeamObject {
    objectId: ID!
    objectType: String!
  }

  input TeamInput {
    role: String
    name: String
    objectId: ID
    objectType: String
    members: [TeamMemberInput]
    global: Boolean
  }

  input TeamWhereInput {
    role: String
    name: String
    objectId: ID
    objectType: String
    members: [TeamMemberInput]
    global: Boolean
    users: [ID!]
    alias: AliasInput
  }

`

module.exports = { resolvers, typeDefs }
