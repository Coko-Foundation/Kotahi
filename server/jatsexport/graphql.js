const models = require('@pubsweet/models')
// eslint-disable-next-line no-unused-vars
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

  if (
    article &&
    article.submission &&
    article.submission.authorNames &&
    article.submission.authorNames.length
  ) {
    articleMetadata.authors = []

    for (let i = 0; i < article.submission.authorNames.length; i += 1) {
      articleMetadata.authors[i] = {
        email: article.submission.authorNames[i].email || '',
        firstName: article.submission.authorNames[i].firstName || '',
        lastName: article.submission.authorNames[i].lastName || '',
        affiliation: article.submission.authorNames[i].affiliation || '',
        id: article.submission.authorNames[i].id || '',
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
  // Below code throws syntax error in console and on XML Download
  // parseString(jats, err => {
  //   if (err) {
  //     console.error(err)
  //     // send back the error if there is an error
  //     parseError = JSON.stringify(err, Object.getOwnPropertyNames(err))
  //   }
  // })

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
