import gql from 'graphql-tag'

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
      formForPurposeAndCategory(purpose: "submit", category: "submission") {
        structure {
          children {
            title
            id
            name
          }
        }
      }
    }
  `,
}
