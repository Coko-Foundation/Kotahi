const jatsHandler = async manuscriptId => {
  console.log(manuscriptId)
  // 1. get manuscript from ID
  // 2. pass it to JATS

  return "Here's some XML!"
}

const resolvers = {
  Query: {
    convertToJats: async (_, { manuscriptId }, ctx) => {
      const jats = await jatsHandler(manuscriptId, ctx)
      return { xml: jats || '' }
    },
  },
}

const typeDefs = `
	extend type Query {
		convertToJats(manuscriptId: String!): ConvertToJatsType
	}

	type ConvertToJatsType {
		xml: String!
	}

`

module.exports = { resolvers, typeDefs }
