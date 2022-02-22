const typeDefs = `
  extend type Query {
    file(id: ID!): File!
    files: [File]!
  }

  extend type Mutation {
    # Using a separate variable because the Upload type hides other data
    uploadFile(file: Upload!): File!
    createFile(file: Upload!, meta: FileMetaInput!): File!
    deleteFile(id: ID!): ID
  }

  input FileMetaInput {
    fileType: String!
    manuscriptId: ID!
    reviewCommentId: ID
  }

 type File implements Object {
   id: ID!
   name: String!
   alt: String
   caption: String
   tags: [String]
   objectId: ID
   storedObjects: [StoredObjects!]!
   uploadStatus: String
   updated: DateTime!
   created: DateTime!
 }

 type ImageMetadata {
   width: Int!
   height: Int!
   space: String
   density: Int
 }

 type StoredObjects {
   type: ImageSize!
   key: String!
   size: Int
   mimetype: String!
   extension: String!
   imageMetadata: ImageMetadata
   url: String
 }

 enum ImageSize {
   original
   medium
   small
 }
`

module.exports = typeDefs
