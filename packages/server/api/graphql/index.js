const fs = require('fs')
const path = require('path')
const merge = require('lodash/merge')

const anyStyleResolvers = require('./anyStyle/anyStyle.resolvers')
const openAiResolvers = require('./openAi/openAi.resolvers')
const rorResolvers = require('./ror/ror.resolvers')
const orcidResolvers = require('./orcid/orcid.resolvers')
const teamResolvers = require('./team/team.resolvers')
const handlebarsResolvers = require('./handlebars/handlebars.resolvers')

const typeDefFilePaths = [
  'anyStyle/anyStyle.graphql',
  'openAi/openAi.graphql',
  'team/team.graphql',
  'ror/ror.graphql',
  'orcid/orcid.graphql',
  'handlebars/handlebars.graphql',
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
  teamResolvers,
  openAiResolvers,
  orcidResolvers,
  rorResolvers,
  handlebarsResolvers,
)

module.exports = {
  typeDefs,
  resolvers,
}
