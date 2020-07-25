const typeDefs = `
  extend type Mutation {
    updateReview(id: ID, input: ReviewInput): Review!
    completeReview(id: ID!): TeamMember
  }

  type Review implements Object {
    id: ID!
    created: DateTime!
    updated: DateTime
    comments: [Comment]
    recommendation: String
    isDecision: Boolean
    open: Boolean
    user: User
  }

  input ReviewInput {
    comments: [CommentInput]
    recommendation: String
    isDecision: Boolean
    manuscriptId: ID!
  }

  input CommentInput {
    type: String
    content: String
  }

  type Comment {
    type: String
    content: String
    files: [File]
  }
`

module.exports = typeDefs
