const typeDefs = `
  extend type Mutation {
    updateReview(id: ID, input: ReviewInput): Review!
    completeReview(id: ID!): TeamMember
  }

  type Review implements Object {
    id: ID!
    created: DateTime!
    updated: DateTime
    comments: [ReviewComment]
    recommendation: String
    isDecision: Boolean
    open: Boolean
    user: User
  }

  input ReviewInput {
    comments: [ReviewCommentInput]
    recommendation: String
    isDecision: Boolean
    manuscriptId: ID!
  }
`

module.exports = typeDefs
