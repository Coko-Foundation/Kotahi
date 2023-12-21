const typeDefs = `
  extend type Query {
    file(id: ID!): File!
    files: [File!]!
    getEntityFiles(input: EntityFilesInput): [File!]!
    getSpecificFiles(ids: [ID!]!): [File!]!
  }

  extend type Mutation {
    # Using a separate variable because the Upload type hides other data
    uploadFile(file: Upload!): File!
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

  input UpdateFileInput {
    id: ID!
    name: String
    alt: String
  }

  input UpdateTagsFileInput {
    id: ID!
    removeTags: [String!]
    addTags: [String!]
  }

  type File {
    id: ID!
    name: String!
    alt: String
    caption: String
    tags: [String]
    objectId: ID
    storedObjects: [StoredObject!]!
    uploadStatus: String
    inUse: Boolean
    updated: DateTime!
    created: DateTime!
  }

  type ImageMetadata {
    width: Int!
    height: Int!
    space: String
    density: Int
  }

  type StoredObject {
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
    full
    medium
    small
  }

  extend type Subscription {
    filesUploaded: Boolean
    fileUpdated: File!
    filesDeleted: Boolean
  }
`

module.exports = typeDefs
