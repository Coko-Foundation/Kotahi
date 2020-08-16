import gql from 'graphql-tag'

export default {
  frontpage: gql`
    {
      publishedManuscripts {
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
            url
            filename
          }
          meta {
            manuscriptId
            title
            articleSections
            articleType
            history {
              type
              date
            }
          }
          published
          submission
          submitter {
            defaultIdentity {
              name
            }
          }
        }
      }
    }
  `,
}
