const models = require('@pubsweet/models')
const { XMLValidator } = require('fast-xml-parser')
const { makeJats } = require('../utils/jatsUtils')
const publicationMetadata = require('../pdfexport/pdfTemplates/publicationMetadata')

const failXML = true // if this is true, we pass errorJats to the parser, invalid XML

const errorJats = `<article xmlns:mml="http://www.w3.org/1998/Math/MathML" xmlns:xlink="http://www.w3.org/1999/xlink" xml:lang="en" dtd-version="1.3">
<front>
<journal-meta>
fe</publisher>
</journal-meta>
<article-meta>
<pub-date-not-available/>
</article-meta>
</front>
<body>
<sec>
<title>Honey bee (<em>Apis mellifera)</em> colonies benefit from grassland/ pasture while bumble bee (<em>Bombus impatiens)</em> colonies in the same landscapes benefit from non-corn/soybean cropland</title>
<list list-type="bullet">
<list-item>
<p>Gabriela M. Quinlan,</p>
</list-item>ng the need for further species-specific land use studies to inform tailored land management.</title>
</sec>`

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

  // check if the output is valid XML – this is NOT checking whether this is valid JATS
  let parseError = null
  const result = XMLValidator.validate(failXML ? errorJats : jats) // this returns true if it's valid, error object if not

  if (typeof result === 'object') {
    parseError = result
  }

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
