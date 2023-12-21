const fetchedObjects = '[members.[user, alias]]'
const models = require('@pubsweet/models')

const {
  updateAlertsUponTeamUpdate,
} = require('../../model-task/src/taskCommsUtils')

const {
  addUserToManuscriptChatChannel,
  removeUserFromManuscriptChatChannel,
} = require('../../model-channel/src/channelCommsUtils')

const resolvers = {
  Query: {
    team(_, { id }, ctx) {
      return models.Team.query().findById(id).withGraphFetched(fetchedObjects)
    },
    teams(_, { where }, ctx) {
      return models.Team.query()
        .where(where || {})
        .withGraphFetched(fetchedObjects)
    },
  },
  Mutation: {
    async deleteTeam(_, { id }, ctx) {
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
      return models.TeamMember.query().updateAndFetchById(id, JSON.parse(input))
    },
  },
  User: {
    teams: (parent, _, ctx) => models.User.relatedQuery('teams').for(parent.id),
  },
  Team: {
    async members(team, { where }, ctx) {
      const t = await models.Team.query().findById(team.id)
      return t.$relatedQuery('members')
    },
    object(team, vars, ctx) {
      const { objectId, objectType } = team
      return objectId && objectType ? { objectId, objectType } : null
    },
  },
  TeamMember: {
    async user(teamMember, vars, ctx) {
      const member = await models.TeamMember.query().findById(teamMember.id)
      return member ? member.$relatedQuery('user') : null
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
