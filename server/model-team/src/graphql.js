const eager = '[members.[user, alias]]'

const resolvers = {
  Query: {
    team(_, { id }, ctx) {
      return ctx.connectors.Team.fetchOne(id, ctx, { eager })
    },
    teams(_, { where }, ctx) {
      where = where || {}
      if (where.users) {
        const { users } = where
        delete where.users
        where._relations = [{ relation: 'users', ids: users }]
      }

      if (where.alias) {
        const { alias } = where
        delete where.alias
        where._relations = [{ relation: 'aliases', object: alias }]
      }

      return ctx.connectors.Team.fetchAll(where, ctx, { eager })
    },
  },
  Mutation: {
    deleteTeam(_, { id }, ctx) {
      return ctx.connectors.Team.delete(id, ctx)
    },
    createTeam(_, { input }, ctx) {
      const options = {
        relate: ['members.user'],
        unrelate: ['members.user'],
        allowUpsert: '[members, members.alias]',
        eager: '[members.[user.teams, alias]]',
      }
      return ctx.connectors.Team.create(input, ctx, options)
    },
    updateTeam(_, { id, input }, ctx) {
      return ctx.connectors.Team.update(id, input, ctx, {
        unrelate: false,
        eager: 'members.user.teams',
      })
    },
  },
  User: {
    teams: (parent, _, ctx) =>
      ctx.connectors.User.fetchRelated(parent.id, 'teams', undefined, ctx),
  },
  Team: {
    members(team, { where }, ctx) {
      return ctx.connectors.Team.fetchRelated(team.id, 'members', where, ctx)
    },
    object(team, vars, ctx) {
      const { objectId, objectType } = team
      return objectId && objectType ? { objectId, objectType } : null
    },
  },
  TeamMember: {
    user(teamMember, vars, ctx) {
      return ctx.connectors.TeamMember.fetchRelated(
        teamMember.id,
        'user',
        undefined,
        ctx,
      )
    },
    alias(teamMember, vars, ctx) {
      return ctx.connectors.TeamMember.fetchRelated(
        teamMember.id,
        'alias',
        undefined,
        ctx,
      )
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
  }

  extend type User {
    teams: [Team]
  }

  type Team {
    id: ID!
    type: String!
    role: String!
    name: String!
    object: TeamObject
    members: [TeamMember!]
    owners: [User]
    global: Boolean
  }

  input TeamMemberInput {
    id: ID
    user: TeamMemberUserInput
    alias: AliasInput
    status: String
  }

  input TeamMemberUserInput {
    id: ID!
  }

  type TeamMember {
    id: ID
    user: User
    status: String
    alias: Alias
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
