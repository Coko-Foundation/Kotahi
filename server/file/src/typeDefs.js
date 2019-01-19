const typeDefs = `
  extend type Mutation {
    createFile(file: Upload!): File!
  }

  type File implements Object  {
    id: ID!
    created: DateTime!
    updated: DateTime
    object: String
    objectId: ID!
    label: String
    fileType: String
    filename: String
    url: String
    mimeType: String
    size: Int
  }
`

module.exports = typeDefs
