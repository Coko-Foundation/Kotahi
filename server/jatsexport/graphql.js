const models = require('@pubsweet/models')
const { makeJats } = require('../utils/jatsUtils')
const publicationMetadata = require('../pdfexport/pdfTemplates/publicationMetadata')

const buildArticleMetadata = metadata => {
  const articleMetadata = {}

  if (metadata?.meta?.manuscriptId) {
    articleMetadata.id = metadata.meta.manuscriptId
  }

  if (metadata?.meta?.title) {
    articleMetadata.title = metadata.meta.title
  }

  if (metadata?.created) {
    articleMetadata.pubDate = metadata.created
  }

  if (metadata?.submission) {
    articleMetadata.submission = JSON.parse(metadata.submission)
  }

  // TODO: deal with author names!

  return articleMetadata
}

const getManuscriptById = async id => {
  return models.Manuscript.query().findById(id)
}

const jatsHandler = async manuscriptId => {
  const manuscript = await getManuscriptById(manuscriptId)

  const html = manuscript.meta.source
  const articleMetadata = buildArticleMetadata(manuscript)

  const { jats } = makeJats(html, articleMetadata, publicationMetadata)
  return jats
}

const resolvers = {
  Query: {
    convertToJats: async (_, { manuscriptId }, ctx) => {
      const jats = await jatsHandler(manuscriptId, ctx)
      return { xml: jats || '' }
    },
  },
}

const typeDefs = `
	extend type Query {
		convertToJats(manuscriptId: String!): ConvertToJatsType
	}

	type ConvertToJatsType {
		xml: String!
	}

`

module.exports = { resolvers, typeDefs }
