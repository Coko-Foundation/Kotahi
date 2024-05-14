const axios = require('axios')
const { Readable } = require('stream')

const File = require('@coko/server/src/models/file/file.model')
const { uploadFileHandler } = require('@coko/server/src/services/fileStorage')

const ArticleTemplate = require('../../../models/articleTemplate/articleTemplate.model')
const CMSFileTemplate = require('../../../models/cmsFileTemplate/cmsFileTemplate.model')

const {
  getFilesWithUrl,
  getFileWithUrl,
} = require('../../utils/fileStorageUtils')

const searchArticleTemplate = async groupId => {
  const groupFiles = await CMSFileTemplate.query().where({
    groupId,
  })

  const rootNode = groupFiles.find(gf => gf.rootFolder === true)

  const layoutsFolder = groupFiles.find(
    gf => gf.parentId === rootNode.id && gf.name === 'layouts',
  )

  return (
    groupFiles.find(
      gf =>
        gf.parentId === layoutsFolder.id && gf.name === 'article-preview.njk',
    ) || null
  )
}

const resolvers = {
  Query: {
    articleTemplate: async (_, { groupId, isCms = false }) => {
      return ArticleTemplate.query()
        .findOne({ groupId, isCms })
        .throwIfNotFound()
    },
  },
  Mutation: {
    async updateTemplate(_, { id, input }) {
      const result = await ArticleTemplate.query().findOne({ id })

      // Needs to be revisited. This is a temp Solution
      // In case we want to update the article template of the CMS we need to do that on the S3
      // Not in ArticleTemplate table
      if (result.isCms === true) {
        const articleFile = await searchArticleTemplate(result.groupId)

        if (articleFile) {
          const file = await File.query().findById(articleFile.fileId)

          const { key, mimetype } = file.storedObjects.find(
            obj => obj.type === 'original',
          )

          await uploadFileHandler(Readable.from(input.article), key, mimetype)
        }

        // eslint-disable-next-line no-param-reassign
        input.article = ''
      }

      return ArticleTemplate.query()
        .patchAndFetchById(id, input)
        .throwIfNotFound()
    },
  },
  ArticleTemplate: {
    async files(articleTemplate) {
      return getFilesWithUrl(
        await File.query().where({ objectId: articleTemplate.groupId }),
      )
    },
    async article(articleTemplate) {
      if (articleTemplate.isCms === true) {
        const articleFile = await searchArticleTemplate(articleTemplate.groupId)
        if (!articleFile) return ''
        const file = await File.query().findById(articleFile.fileId)

        const { storedObjects } = await getFileWithUrl(file)

        const fileUrl = storedObjects.find(f => f.type === 'original')

        const response = await axios({
          method: 'get',
          url: fileUrl.url,
        })

        return response.data.toString()
      }

      return articleTemplate.article
    },
  },
}

const typeDefs = `
  extend type Query {
    articleTemplate(groupId: ID!, isCms: Boolean!): ArticleTemplate!
  }

  extend type Mutation {
    updateTemplate(id: ID!, input: UpdateTemplateInput!): ArticleTemplate!
  }

  type ArticleTemplate {
    id: ID!
    created: DateTime!
    updated: DateTime
    name: String
    article: String!
    css: String!
    groupId: ID!
    files: [File!]
  }

  input UpdateTemplateInput {
    article: String
    css: String
  }
`

module.exports = { typeDefs, resolvers }
