const fs = require('fs')
const path = require('path')
const merge = require('lodash/merge')

const anyStyleResolvers = require('./anyStyle/anyStyle.resolvers')
const chatGPTResolvers = require('./chatGPT/chatGPT.resolvers')

const typeDefFilePaths = [
  'anyStyle/anyStyle.graphql',
  'chatGPT/chatGPT.graphql',
]

const createTotalTypeDefs = paths => {
  return paths
    .map(p => fs.readFileSync(path.join(__dirname, p), 'utf-8'))
    .join(' ')
}

const typeDefs = createTotalTypeDefs(typeDefFilePaths)

const resolvers = merge({}, anyStyleResolvers, chatGPTResolvers)

module.exports = {
  typeDefs,
  resolvers,
}
