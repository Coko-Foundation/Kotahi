const typeDefs = `
type ArticleImportHistory {
    id: ID!
    date: DateTime
    source_id: ArticleImportSources
  }
`

module.exports = { typeDefs }
