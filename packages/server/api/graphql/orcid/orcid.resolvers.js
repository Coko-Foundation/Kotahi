const { orcidValidate } = require('../../../controllers/orcid.controllers')

const orcidResolver = (_, { input }) => {
  return orcidValidate(input)
}

module.exports = {
  Query: {
    orcidValidate: orcidResolver,
  },
}
