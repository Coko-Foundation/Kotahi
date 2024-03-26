const fs = require('fs')
const path = require('path')
const chatGPTResolvers = require('./chatGPT.resolvers')

module.exports = {
  typeDefs: fs.readFileSync(path.join(__dirname, 'chatGPT.graphql'), 'utf-8'),
  resolvers: chatGPTResolvers,
}
