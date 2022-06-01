// const models = require('@pubsweet/models')

// const resolvers = {
//   Query: {
//     async getManuscriptId(_, vars, ctx) {
//       return models.Invitation.query()
//     },
//   },
// }

const typeDefs = `
type Invitation {
    id: ID!
    created: DateTime!
    updated: DateTime
    manuscript_id: ID!
    purpose: String!
    to_email: String!
    status: String!
    sender_id: ID
  }
`

module.exports = { typeDefs }
