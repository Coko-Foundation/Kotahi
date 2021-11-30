const eager = '[members.[user, alias]]'
const models = require('@pubsweet/models')

const resolvers = {
  Query: {
    team(_, { id }, ctx) {
      return models.Team.query().findById(id).eager(eager)
    },
    teams(_, { where }, ctx) {
      // eslint-disable-next-line no-param-reassign
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

      return models.Team.query().where(where).eager(eager)
    },
  },
  Mutation: {
    deleteTeam(_, { id }, ctx) {
      return models.Team.query().deleteById(id)
    },
    createTeam(_, { input }, ctx) {
      const options = {
        relate: ['members.user'],
        unrelate: ['members.user'],
        allowUpsert: '[members, members.alias]',
        eager: '[members.[user.teams, alias]]',
      }

      return models.Team.query().insertGraphAndFetch(input, options)
    },
    updateTeam(_, { id, input }, ctx) {
      return models.Team.query().upsertGraphAndFetch(
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
    updateTeamMember(_, { id, input }, ctx) {
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
    manuscript(parent, vars, ctx) {
      return models.Manuscript.query().findById(parent.manuscriptId)
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
