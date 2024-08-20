const fs = require('fs')
const path = require('path')
const merge = require('lodash/merge')

const anyStyleResolvers = require('./anyStyle/anyStyle.resolvers')

const typeDefFilePaths = ['anyStyle/anyStyle.graphql']

const createTotalTypeDefs = paths => {
  return paths
    .map(p => fs.readFileSync(path.join(__dirname, p), 'utf-8'))
    .join(' ')
}

const typeDefs = createTotalTypeDefs(typeDefFilePaths)

const resolvers = merge({}, anyStyleResolvers)

module.exports = {
  typeDefs,
  resolvers,
}
