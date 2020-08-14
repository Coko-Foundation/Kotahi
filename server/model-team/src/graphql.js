const eager = '[members.[user, alias]]'

const resolvers = {
  Query: {
    team(_, { id }, ctx) {
      return ctx.models.Team.query()
        .findById(id)
        .eager(eager)
    },
    teams(_, { where }, ctx) {
      where = where || {}
      // if (where.users) {
      //   const { users } = where
      //   delete where.users
      //   where._relations = [{ relation: 'users', ids: users }]
      // }

      // if (where.alias) {
      //   const { alias } = where
      //   delete where.alias
      //   where._relations = [{ relation: 'aliases', object: alias }]
      // }

      return ctx.models.Team.query()
        .where(where)
        .eager(eager)
    },
  },
  Mutation: {
    deleteTeam(_, { id }, ctx) {
      return ctx.models.Team.query().deleteById(id)
    },
    createTeam(_, { input }, ctx) {
      const options = {
        relate: ['members.user'],
        unrelate: ['members.user'],
        allowUpsert: '[members, members.alias]',
        eager: '[members.[user.teams, alias]]',
      }
      return ctx.models.Team.query().insertGraphAndFetch(input, options)
    },
    updateTeam(_, { id, input }, ctx) {
      return ctx.models.Team.query().upsertGraphAndFetch(
        {
          id,
          ...input,
        },
        {
          relate: ['members.user'],
          unrelate: ['members.user'],
          eager: 'members.user.teams',
        },
      )
    },
  },
  User: {
    teams: (parent, _, ctx) =>
      ctx.models.User.relatedQuery('teams').for(parent.id),
  },
  Team: {
    async members(team, { where }, ctx) {
      const t = await ctx.models.Team.query().findById(team.id)
      return t.$relatedQuery('members')
    },
    manuscript(parent, vars, ctx) {
      return ctx.models.Manuscript.query().findById(parent.manuscriptId)
    },
  },
  TeamMember: {
    async user(teamMember, vars, ctx) {
      const member = await ctx.models.TeamMember.query().findById(teamMember.id)
      return member.$relatedQuery('user')
    },
    async alias(teamMember, vars, ctx) {
      const member = await ctx.models.TeamMember.query().findById(teamMember.id)
      return member.$relatedQuery('alias')
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
    name: String
    manuscript: Manuscript
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

  input TeamInput {
    role: String
    name: String
    manuscriptId: ID
    members: [TeamMemberInput]
    global: Boolean
  }

  input TeamWhereInput {
    role: String
    name: String
    manuscriptId: ID
    members: [TeamMemberInput]
    global: Boolean
    users: [ID!]
    alias: AliasInput
  }

`

module.exports = { resolvers, typeDefs }
