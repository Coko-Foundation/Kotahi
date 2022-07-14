import gql from 'graphql-tag'

const formFields = `
  structure {
    children {
      id
      name
      title
      shortDescription
      component
      options {
        id
        label
        value
      }
    }
  }
`

export default {
  frontpage: gql`
    query publishedManuscriptsAndForm(
      $sort: String
      $offset: Int
      $limit: Int
    ) {
      publishedManuscripts(sort: $sort, offset: $offset, limit: $limit) {
        totalCount
        manuscripts {
          id
          reviews {
            id
            open
            canBePublishedPublicly
            created
            isDecision
            user {
              id
              username
            }
            jsonData
          }
          status
          files {
            id
            name
            tags
            storedObjects {
              mimetype
              url
            }
          }
          meta {
            manuscriptId
            title
            source
          }
          published
          submission
          evaluationsHypothesisMap
        }
      }
      submissionForm: formForPurposeAndCategory(
        purpose: "submit"
        category: "submission"
      ) {
        ${formFields}
      }
      decisionForm: formForPurposeAndCategory(
        purpose: "decision"
        category: "decision"
      ) {
        ${formFields}
      }
      reviewForm: formForPurposeAndCategory(
        purpose: "review"
        category: "review"
      ) {
        ${formFields}
      }
    }
  `,
}
