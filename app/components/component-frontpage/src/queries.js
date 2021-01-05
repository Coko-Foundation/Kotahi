import gql from 'graphql-tag'

export default {
  frontpage: gql`
   
  query publishedManuscripts(
    $sort: String
    $offset: Int
    $limit: Int
  ) {
    publishedManuscripts(
      sort: $sort
      offset: $offset
      limit: $limit
    ) {
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
            fileType
	    mimeType
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
