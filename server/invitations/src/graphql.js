const typeDefs = `
type Invitation {
    id: ID!
    date: DateTime
    source_id: Invitation
  }
`

module.exports = { typeDefs }
