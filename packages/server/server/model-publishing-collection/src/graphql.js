const models = require('@pubsweet/models')
const { createFile, deleteFiles } = require('@coko/server')
const { getFileWithUrl } = require('../../utils/fileStorageUtils')

const resolvers = {
  Query: {
    publishingCollection: async (_, { groupId }, ctx) => {
      const publishingCollection =
        await models.PublishingCollection.query().where({
          groupId,
        })

      return publishingCollection.map(col => {
        return { ...col, formData: { ...col.formData, active: col.active } }
      })
    },
  },
  Mutation: {
    createCollection: async (_, { input }, ctx) => {
      let publishingCollection = await models.PublishingCollection.query()
        .insert({
          active: input.active,
          formData: {
            ...input.formData,
            image: null,
          },
          groupId: ctx.req.headers['group-id'],
          manuscripts: input.manuscripts,
        })
        .returning('*')

      if (input.formData.image) {
        const { filename, createReadStream: stream } = await input.formData
          .image

        const file = await createFile(
          stream(),
          filename,
          null,
          null,
          ['publishingCollection'],
          publishingCollection.id,
        )

        publishingCollection = await models.PublishingCollection.query()
          .patch({
            formData: {
              ...publishingCollection.formData,
              image: file.id,
            },
          })
          .findOne({ id: publishingCollection.id })
          .returning('*')
      }

      publishingCollection.formData.active = publishingCollection.active

      return publishingCollection
    },

    deleteCollection: async (_, { id }) => {
      try {
        const collection = await models.PublishingCollection.query()
          .delete()
          .findOne({ id })
          .returning('*')

        await deleteFiles([collection.formData.image])
        return { success: true }
      } catch (e) {
        return { success: false }
      }
    },

    updateCollection: async (_, { id, input }) => {
      const collection = await models.PublishingCollection.query().findOne({
        id,
      })

      let file = null

      if (input.formData.image) {
        if (collection.formData.image) {
          await deleteFiles([collection.formData.image])
        }

        const { filename, createReadStream: stream } = await input.formData
          .image

        file = await createFile(
          stream(),
          filename,
          null,
          null,
          ['publishingCollection'],
          id,
        )
      } else if (collection.formData.image && input.formData.image === null) {
        await deleteFiles([collection.formData.image])
      }

      const publishingCollection =
        await models.PublishingCollection.query().updateAndFetchById(id, {
          ...input,
          formData: {
            ...input.formData,
            image: file ? file.id : collection.formData.image,
          },
        })

      publishingCollection.formData.active = publishingCollection.active

      return publishingCollection
    },
  },
  PublishCollection: {
    manuscripts: async parent => {
      if (parent.manuscripts?.length) {
        const manuscripts = await models.Manuscript.query().whereIn(
          'id',
          parent.manuscripts,
        )

        return parent.manuscripts.map(id => manuscripts.find(m => m.id === id))
      }

      return []
    },
  },
  PublishingCollectionFormData: {
    image: async parent => {
      // Return the image field from the formData object within the parent (metadata) object
      const file = await models.File.query().findOne({ id: parent.image })

      if (file) {
        const data = await getFileWithUrl(file)
        return data.storedObjects.find(img => img.type === 'small')?.url
      }

      return ''
    },
    file: async parent => {
      let file = null

      if (parent.image !== '') {
        file = await models.File.query().findOne({ id: parent.image })
      }

      return file
    },
  },
}

const typeDefs = `
  extend type Query {
    publishingCollection(groupId: ID!): [PublishCollection!]!
  }

  extend type Mutation {
    createCollection(input: PublishCollectionInput!): PublishCollection!
    updateCollection(id: ID!, input: PublishCollectionInput!): PublishCollection!
    deleteCollection(id: ID!): PublishingCollectionDeleteResponse!
  }

  type PublishCollection {
    id: ID!
    created: DateTime!
    updated: DateTime
    formData: PublishingCollectionFormData!
    active: Boolean!
    manuscripts: [Manuscript!]!
    groupId: ID!
  }

  type formJournalData {
    title: String!
    description: String!
    contact: String!
    logoPath: String!
    issn: String!
  }

  type PublishingCollectionFormData {
    title: String!
    description: String!
    publicationDate: String!
    image: String!
    issueNumber: String!
    file: File
  }

  input PublishCollectionInput {
    formData: PublishingCollectionFormDataInput!
    active: Boolean!
    manuscripts: [ID!]!
  }

  input PublishingCollectionFormDataInput {
    title: String!
    description: String!
    publicationDate: String!
    image: Upload
    issueNumber: String!
  }

  type PublishingCollectionDeleteResponse {
    success: Boolean!
  }
`

module.exports = { typeDefs, resolvers }
