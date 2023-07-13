const axios = require('axios')
const config = require('config')

const { port, protocol, host } = config['flax-site']

const serverUrl = `${protocol}://${host}${port ? `:${port}` : ''}`

const currentAppUrl = config['flax-site'].clientAPIURL

const flaxSiteAccessToken = ''

const rebuild = async params => {
  const requestData = JSON.stringify({
    updatedConfig: {
      url: `${currentAppUrl}/graphql`,
    },
    buildConfigs: params,
  })

  return new Promise((resolve, reject) => {
    axios({
      method: 'post',
      url: `${serverUrl}/rebuild`,
      headers: {
        authorization: `Bearer ${flaxSiteAccessToken}`,
        'Content-Type': 'application/json',
      },
      data: requestData,
    })
      .then(async res => {
        const htmledResult = res.data
        resolve(htmledResult)
      })
      .catch(async err => {
        const { response } = err

        if (!response) {
          return reject(
            new Error(
              `Flax Site request failed while  rebuilding: ${err.code}, ${err}`,
            ),
          )
        }

        const { status, data } = response
        const { msg } = data

        return reject(
          new Error(
            `Flax Site request failed while rebuilding with status ${status} and message: ${msg}`,
          ),
        )
      })
  })
}

const healthCheck = async () => {
  const url = `${serverUrl}/healthcheck`

  try {
    const serviceHealthCheck = await axios({
      method: 'get',
      url,
    })

    return {
      data: serviceHealthCheck.data,
    }
  } catch (err) {
    return {
      err,
    }
  }
}

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
        status = await rebuild(params)
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
