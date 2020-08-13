const typeDefs = `
  extend type Mutation {
    updateReview(id: ID, input: ReviewInput): Review!
    completeReview(id: ID!): TeamMember
  }

  type Review implements Object {
    id: ID!
    created: DateTime!
    updated: DateTime
    recommendation: String
    isDecision: Boolean
    open: Boolean
    user: User
    reviewComment: ReviewComment
    confidentialComment: ReviewComment
    decisionComment: ReviewComment
  }

  input ReviewInput {
    reviewComment: ReviewCommentInput
    confidentialComment: ReviewCommentInput
    decisionComment: ReviewCommentInput
    recommendation: String
    isDecision: Boolean
    manuscriptId: ID!
  }

  type ReviewComment implements Object {
    id: ID!
    created: DateTime!
    updated: DateTime
    commentType: String
    content: String
    files: [File]
  }

  input ReviewCommentInput {
    id: ID
    commentType: String
    content: String
  }
`

module.exports = typeDefs
