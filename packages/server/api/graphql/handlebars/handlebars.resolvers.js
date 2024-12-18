const { getVariables } = require('../../../controllers/handlebars.controllers')

const getVariablesResolver = async (_, { groupId }) => {
  return getVariables(groupId)
}

module.exports = {
  Query: {
    getVariables: getVariablesResolver,
  },
}
