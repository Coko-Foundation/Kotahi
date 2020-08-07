const typeDefs = `
  type ReviewComment implements Object {
    id: ID!
    created: DateTime!
    updated: DateTime
    type: String
    content: String
    files: [File]
  }

  input ReviewCommentInput {
    type: String
    content: String
  }
`

module.exports = typeDefs
