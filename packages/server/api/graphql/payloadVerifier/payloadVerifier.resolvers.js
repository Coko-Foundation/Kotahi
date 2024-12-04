const {
  checkApiPayload,
} = require('../../../controllers/payloadVerifier/payloadVerifier.controllers')

const checkApiPayloadResolver = async (_, { id, api }) => {
  const payload = await checkApiPayload(id, api)
  return payload
}

const resolvers = {
  Query: {
    checkApiPayload: checkApiPayloadResolver,
  },
}

module.exports = resolvers
