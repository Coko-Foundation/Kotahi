const models = require('@pubsweet/models')
const { XMLValidator } = require('fast-xml-parser')
const { makeJats } = require('../utils/jatsUtils')
const articleMetadata = require('../pdfexport/pdfTemplates/articleMetadata')
const publicationMetadata = require('../pdfexport/pdfTemplates/publicationMetadata')
const validateJats = require('./validation')
const makeZippedJats = require('./makeZippedJats')

const failXML = false // if this is true, we pass errorJats (which is invalid XML) to the parser
const skipValidation = false

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

const getManuscriptById = async id => {
  return models.Manuscript.query().findById(id)
}

const jatsHandler = async manuscriptId => {
  const manuscript = await getManuscriptById(manuscriptId)
  const html = manuscript.meta.source

  const { jats } = makeJats(
    html,
    articleMetadata(manuscript),
    publicationMetadata,
  )

  // check if the output is valid XML – this is NOT checking whether this is valid JATS
  let parseError = null

  if (!skipValidation) {
    const xmlResult = XMLValidator.validate(failXML ? errorJats : jats) // this returns true if it's valid, error object if not

    if (typeof xmlResult === 'object') {
      parseError = xmlResult
      return { jats, error: parseError }
    }

    // if we have valid XML, then check for valid jats

    const jatsResult = validateJats(jats) // this returns empty array if it's valid, array of errors if not

    if (jatsResult.length) {
      parseError = jatsResult
    }
  }

  return { jats, error: parseError }
}

const resolvers = {
  Query: {
    convertToJats: async (_, { manuscriptId }, ctx) => {
      const { jats, error } = await jatsHandler(manuscriptId, ctx)
      // eslint-disable-next-line prefer-const
      let returnedJats = { link: '', jats }

      if (jats) {
        returnedJats = await makeZippedJats(manuscriptId, jats)
      }

      return {
        xml: returnedJats.jats || '',
        zipLink: returnedJats.link,
        error: error ? JSON.stringify(error) : '',
      }
    },
  },
}

const typeDefs = `
	extend type Query {
		convertToJats(manuscriptId: String!): ConvertToJatsType
	}

	type ConvertToJatsType {
		xml: String!
		zipLink: String
		error: String
	}

`

module.exports = { resolvers, typeDefs }
