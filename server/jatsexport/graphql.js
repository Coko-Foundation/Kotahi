const models = require('@pubsweet/models')
const { parseString } = require('xml2js')
const { makeJats } = require('../utils/jatsUtils')
const publicationMetadata = require('../pdfexport/pdfTemplates/publicationMetadata')

const buildArticleMetadata = article => {
  const articleMetadata = {}

  if (article && article.meta && article.meta.manuscriptId) {
    articleMetadata.id = article.meta.manuscriptId
  }

  if (article && article.meta && article.meta.title) {
    articleMetadata.title = article.meta.title
  }

  if (article && article.created) {
    articleMetadata.pubDate = article.created
  }

  if (article && article.submission) {
    articleMetadata.submission = article.submission
  }

  if (article && article.authors && article.authors.length) {
    articleMetadata.authors = []

    for (let i = 0; i < article.authors.length; i += 1) {
      articleMetadata.authors[i] = {
        email: article.authors[i].email,
        firstName: article.authors[i].firstName,
        lastName: article.authors[i].lastName,
        affiliation: article.authors[i].affiliation,
      }
    }
  }

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
  let parseError = null

  // check if this is valid XML – this is NOT checking whether this is valid JATS
  parseString(jats, err => {
    if (err) {
      console.error(err)
      // send back the error if there is an error
      parseError = JSON.stringify(err, Object.getOwnPropertyNames(err))
    }
  })

  return { jats, error: parseError }
}

const resolvers = {
  Query: {
    convertToJats: async (_, { manuscriptId }, ctx) => {
      const { jats, error } = await jatsHandler(manuscriptId, ctx)
      return { xml: jats || '', error: error || null }
    },
  },
}

const typeDefs = `
	extend type Query {
		convertToJats(manuscriptId: String!): ConvertToJatsType
	}

	type ConvertToJatsType {
		xml: String!
		error: String
	}

`

module.exports = { resolvers, typeDefs }
