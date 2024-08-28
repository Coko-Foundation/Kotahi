const fs = require('fs')
const path = require('path')
const merge = require('lodash/merge')

const anyStyleResolvers = require('./anyStyle/anyStyle.resolvers')
const chatGPTResolvers = require('./chatGPT/chatGPT.resolvers')
const rorResolvers = require('./ror/ror.resolvers')
const orcidResolvers = require('./orcid/orcid.resolvers')
const teamResolvers = require('./team/team.resolvers')

const typeDefFilePaths = [
  'anyStyle/anyStyle.graphql',
  'chatGPT/chatGPT.graphql',
  'team/team.graphql',
  'ror/ror.graphql',
  'orcid/orcid.graphql',
]

const createTotalTypeDefs = paths => {
  return paths
    .map(p => fs.readFileSync(path.join(__dirname, p), 'utf-8'))
    .join(' ')
}

const typeDefs = createTotalTypeDefs(typeDefFilePaths)

const resolvers = merge(
  {},
  anyStyleResolvers,
  chatGPTResolvers,
  teamResolvers,
  rorResolvers,
  orcidResolvers,
)

module.exports = {
  typeDefs,
  resolvers,
}
