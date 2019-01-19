const File = require('./file')

const resolvers = {
  Query: {},
  Mutation: {
    async createFile(_, { id, file }, ctx) {
      const data = await new File(file).save()
      return data
    },
  },
}

module.exports = resolvers
