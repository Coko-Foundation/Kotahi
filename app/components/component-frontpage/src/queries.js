import gql from 'graphql-tag'

export default {
  frontpage: gql`
    query publishedManuscripts($sort: String, $offset: Int, $limit: Int) {
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
          publishedArtifacts {
            id
            manuscriptId
            platform
            externalId
            title
            content
            hostedInKotahi
          }
        }
      }
    }
  `,
}
