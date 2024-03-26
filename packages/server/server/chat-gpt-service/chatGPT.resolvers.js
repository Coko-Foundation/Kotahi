const chatGPT = require('./chatGPT.controllers')

const chatGPTResolver = async (_, { input, history, groupId }) => {
  return chatGPT(input, history, groupId)
}

module.exports = {
  Query: {
    chatGPT: chatGPTResolver,
  },
}
