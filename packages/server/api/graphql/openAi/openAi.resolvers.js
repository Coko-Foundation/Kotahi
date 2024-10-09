const { openAi } = require('../../../controllers/openAi/openAi.controller')

const openAiResolver = async (
  _,
  { input, groupId, history, format, system },
) => {
  return openAi({ input, groupId, history, format, system })
}

module.exports = {
  Query: {
    openAi: openAiResolver,
  },
}
