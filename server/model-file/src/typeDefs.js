const typeDefs = `
  extend type Mutation {
    # Using a separate variable because the Upload type hides other data
    createFile(file: Upload!, meta: FileMetaInput): File!
  }

  input FileMetaInput {
    fileType: String
    filename: String
    mimeType: String
    manuscriptId: ID
    reviewCommentId: ID
    label: String
    size: Int
  }

  type File implements Object  {
    id: ID!
    created: DateTime!
    updated: DateTime
    manuscriptId: ID
    reviewCommentId: ID
    label: String
    fileType: String
    filename: String
    url: String
    mimeType: String
    size: Int
  }
`

module.exports = typeDefs
