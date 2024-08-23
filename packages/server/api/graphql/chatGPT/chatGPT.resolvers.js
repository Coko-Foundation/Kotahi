const chatGPT = require('../../../controllers/chatGPT.controllers')

const chatGPTResolver = async (_, { input, history, groupId }) => {
  return chatGPT(input, history, groupId)
}

module.exports = {
  Query: {
    chatGPT: chatGPTResolver,
  },
}
