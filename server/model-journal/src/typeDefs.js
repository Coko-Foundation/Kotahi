const typeDefs = `
  extend type Query {
    journals: Journal!
  }

  interface Object {
    id: ID!
    created: DateTime!
    updated: DateTime
  }

  type Journal implements Object {
    id: ID!
    created: DateTime!
    updated: DateTime
    title: String!
    manuscripts: [Manuscript]
    meta: JournalMeta
  }

  type JournalMeta {
    publisherName: String
  }

  #extend type Team {
  #  role: String
  #  objectType: String
  #}

  scalar DateTime
`

module.exports = typeDefs
