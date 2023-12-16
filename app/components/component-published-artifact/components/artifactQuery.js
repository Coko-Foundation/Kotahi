import gql from 'graphql-tag'

export default gql`
  query publishedManuscriptAndForms($id: ID!) {
    publishedManuscript(id: $id) {
      id
      meta {
        manuscriptId
      }
      submission
      publishedArtifacts {
        id
        updated
        manuscriptId
        platform
        externalId
        title
        content
        hostedInKotahi
        relatedDocumentUri
        relatedDocumentType
      }
    }
  }
`
