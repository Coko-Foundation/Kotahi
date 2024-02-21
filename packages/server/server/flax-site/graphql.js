const { healthCheck, rebuildCMSSite } = require('./flax-api')

const resolvers = {
  Query: {
    flaxHealthCheck: async (_, vars, ctx) => {
      let status = 'Nothing'
      const error = 'Nothing'
      status = await healthCheck()
      status = JSON.stringify(status)
      return { status, error }
    },
  },

  Mutation: {
    rebuildFlaxSite: async (_, { params: paramsAsJson }, ctx) => {
      const params = paramsAsJson ? JSON.parse(paramsAsJson) : {}
      let status = ''
      let error = ''

      try {
        const groupId = ctx.req.headers['group-id']
        status = await rebuildCMSSite(groupId, params)
      } catch (e) {
        error = e
      }

      return {
        status: status ? status.message : '',
        error: error ? JSON.stringify(error) : '',
      }
    },
  },
}

const typeDefs = `

  extend type Query {
    flaxHealthCheck : rebuildFlaxSiteResponse
  }

  extend type Mutation {
		rebuildFlaxSite(params: String) : rebuildFlaxSiteResponse
	}

	type rebuildFlaxSiteResponse {
		status: String!
		error: String
	}
`

module.exports = { resolvers, typeDefs }
