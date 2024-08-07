const typeDefs = `
  extend type Query {
    file(id: ID!): File!
    files: [File!]!
    getEntityFiles(input: EntityFilesInput): [File!]!
    getSpecificFiles(ids: [ID!]!): [File!]!
  }

  extend type Mutation {
    # Using a separate variable because the Upload type hides other data
    uploadFile(file: Upload!): FileNotInDb!
    createFile(file: Upload!, meta: FileMetaInput!): File!
    uploadFiles(files: [Upload]!, fileType: String, entityId: ID): [File]!
    deleteFile(id: ID!): ID
    deleteFiles(ids: [ID!]!): [ID]!
    updateFile(input: UpdateFileInput!): File!
    updateTagsFile(input: UpdateTagsFileInput!): File!
  }

  input EntityFilesInput {
    entityId: ID!
    sortingParams: [SortingParams]
    includeInUse: Boolean
  }

  input SortingParams {
    key: String!
    order: Order!
  }

  enum Order {
    asc
    desc
  }

  input FileMetaInput {
    fileType: String!
    manuscriptId: ID!
    reviewId: ID
  }

  input UpdateTagsFileInput {
    id: ID!
    removeTags: [String!]
    addTags: [String!]
  }

  extend type File {
    tags: [String]
    objectId: ID
    inUse: Boolean
  }

  type FileNotInDb {
    name:String!
    storedObjects:[StoredObjects!]!
  }

  extend type StoredObjects {
    url: String
  }

  extend enum ImageSize {
    full
  }

  extend type Subscription {
    filesUploaded: Boolean
    fileUpdated: File!
    filesDeleted: Boolean
  }
`

module.exports = typeDefs
