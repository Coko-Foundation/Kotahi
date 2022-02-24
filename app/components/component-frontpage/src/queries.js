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
            recommendation
            reviewComment {
              content
            }
            created
            isDecision
            user {
              id
              username
            }
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
            articleSections
            articleType
            source
            history {
              type
              date
            }
          }
          published
          submission
          evaluationsHypothesisMap
          submitter {
            defaultIdentity {
              name
            }
          }
        }
      }
      formForPurpose(purpose: "submit") {
        structure {
          children {
            title
            shortDescription
            id
            name
          }
        }
      }
    }
  `,
}
