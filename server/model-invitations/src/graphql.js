const typeDefs = `
type Invitations {
    id: ID!
    date: DateTime
    source_id: Invitations
  }
`

module.exports = { typeDefs }
