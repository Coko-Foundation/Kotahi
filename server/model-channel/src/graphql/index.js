const fetch = require('node-fetch')

const Channel = require('../channel')

const resolvers = {
  Query: {
    manuscriptChannel: async (_, { manuscriptId }, context) => {
      const manuscript = context.connectors.Manuscript.fetchOne(manuscriptId)
      return Channel.find(manuscript.channelId)
    },
    teamByName: async (_, { name }, context) => {
      const Team = context.connectors.Team.model
      return Team.query().where({ name }).eager('[channels, members]').first()
    },
    channelsByTeamName: async (_, { teamName }, context) =>
      Channel.query().joinRelation('team').where({ 'team.name': teamName }),
    channels: async () => Channel.query().where({ teamId: null }),
    findByDOI: async (_, { doi }) => Channel.query().where({ doi }).first(),
    searchOnCrossref: async (_, { searchTerm }, context) => {
      // https://api.crossref.org/works?query=renear+ontologies
      const res = await fetch(
        `https://api.crossref.org/works?query=${searchTerm}`,
      )

      const json = await res.json()

      const works = json.message.items.map(item => ({
        DOI: item.DOI,
        title: item.title.join(', '),
        author: JSON.stringify(item.author),
        year: item.created['date-time'],
      }))

      return works
    },
  },
  Mutation: {
    createChannel: async (_, { name, teamId }, context) => {
      const channel = await new Channel({
        name,
        teamId,
        userId: context.user,
      }).save()

      return channel
    },
    createChannelFromDOI: async (_, { doi }, context) => {
      const res = await fetch(`https://api.crossref.org/works/${doi}`)
      const { message: work } = await res.json()

      const channel = await new Channel({
        doi: work.DOI,
        topic: work.title.join(', '),
        userId: context.user,
      }).save()

      return channel
    },
    changeTopic: async (_, { channelId, topic }, context) => {
      const channel = await context.connectors.Channel.model.find(channelId)
      channel.topic = topic
      return channel.save()
    },
  },
  // Subscription: {
  // },
}

const typeDefs = `
  type Channel {
    id: String
    manuscript: Manuscript
    topic: String
    type: String
    team: Team
  }

  extend type Team {
    channels: [Channel]
  }

  type Work {
    DOI: String
    title: String
    author: String
    year: String
  }

  extend type Query {
    teamByName(name: String!): Team
    channelsByTeamName(teamName: String!): [Channel]
    findByDOI(doi: String): Channel
    searchOnCrossref(searchTerm: String): [Work]
    channels: [Channel]
    manuscriptChannel: Channel
  }

  extend type Mutation {
    createChannel(name: String, teamId: ID): Channel
    createChannelFromDOI(doi: String): Channel
    changeTopic(channelId: ID, topic: String): Channel
  }
`

module.exports = { typeDefs, resolvers }
