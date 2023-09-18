const { logger } = require('@coko/server')

const {
  getMatchingReferencesFromCrossRef,
  getFormattedReferencesFromCrossRef,
  getReferenceWithDoi,
} = require('./validation')

const { formatCitation } = require('./formatting')

const Config = require('../../config/src/config')

/* eslint-disable prefer-destructuring */
const resolvers = {
  Query: {
    async getMatchingReferences(_, { input }, ctx) {
      // This function just returns a reference as CSL.
      const groupId = ctx.req.headers['group-id']

      const activeConfig = await Config.query().findOne({
        groupId,
        active: true,
      })

      const crossrefRetrievalEmail =
        activeConfig.formData.production?.crossrefRetrievalEmail

      const crossrefSearchResultCount =
        activeConfig.formData.production?.crossrefSearchResultCount

      try {
        const matches = await getMatchingReferencesFromCrossRef(
          input.text,
          input.count || crossrefSearchResultCount || 3,
          crossrefRetrievalEmail,
        )

        return { matches, success: true, message: '' }
      } catch (error) {
        logger.error('Citeproc response error:', error.message)
        return { matches: [], success: false, message: 'error' }
      }
    },
    async getFormattedReferences(_, { input }, ctx) {
      // This returns a reference as CSL with a formatetedCitation property that includes the HTML version of the citation.
      const groupId = ctx.req.headers['group-id']

      const activeConfig = await Config.query().findOne({
        groupId,
        active: true,
      })

      const crossrefRetrievalEmail =
        activeConfig.formData.production?.crossrefRetrievalEmail

      const crossrefSearchResultCount =
        activeConfig.formData.production?.crossrefSearchResultCount

      try {
        const matches = await getFormattedReferencesFromCrossRef(
          input.text,
          input.count || crossrefSearchResultCount || 3,
          crossrefRetrievalEmail,
          groupId,
        )

        return { matches, success: true, message: '' }
      } catch (error) {
        logger.error('Crossref response error:', error.message)
        return { matches: [], success: false, message: 'error' }
      }
    },
    async getReferenceFromDoi(_, { doi }, ctx) {
      // This looks up a citation based on the DOI. Not exposed in the frontend yet.
      const groupId = ctx.req.headers['group-id']

      const activeConfig = await Config.query().findOne({
        groupId,
        active: true,
      })

      const crossrefRetrievalEmail =
        activeConfig.formData.production?.crossrefRetrievalEmail

      try {
        const reference = await getReferenceWithDoi(doi, crossrefRetrievalEmail)

        return { reference, success: true, message: '' }
      } catch (error) {
        logger.error('Crossref response error for DOI lookup:', error.message)
        return { reference: {}, success: false, message: 'error' }
      }
    },
    async formatCitation(_, { citation }, ctx) {
      // You know, it's probably bad to have two formatCitation functions!
      // citation should be stringified CSL

      try {
        const { result, error } = await formatCitation(
          citation,
          ctx.req.headers['group-id'],
        )

        return { formattedCitation: result, error }
      } catch (error) {
        return { formattedCitation: '', error: error.message }
      }
    },
  },
}

const typeDefs = `
  input CitationSearchInput {
    text: String!
    count: Int 
  }

  extend type Query {
    getMatchingReferences(input: CitationSearchInput): CitationSearchResult
    getFormattedReferences(input: CitationSearchInput): FormattedCitationSearchResult
    getReferenceFromDoi(doi:String!): CitationSearchSingleResult
		formatCitation(citation: String!): CitationFormatResult
  }

  type CitationSearchSingleResult {
    success: Boolean
    message: String
    reference: Reference
  }

  type CitationSearchResult {
    success: Boolean
    message: String
    matches: [Reference]
  }

	type FormattedCitationSearchResult {
    success: Boolean
    message: String
    matches: [FormattedReference]
  }

  type ReferenceAuthor {
    given: String
    family: String
    sequence: String
  }

  type Reference {
    doi: String
    author: [ReferenceAuthor]
    issue: String
    page: String
    title: String
    volume: String
    journalTitle: String
  }

	type FormattedReference {
    doi: String
    author: [ReferenceAuthor]
    issue: String
    page: String
    title: String
    volume: String
    journalTitle: String
		formattedCitation: String
  }


	type CitationFormatResult {
		formattedCitation: String
		error: String
	}
`

module.exports = {
  typeDefs,
  resolvers,
}
