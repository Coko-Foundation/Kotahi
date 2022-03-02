import { gql } from '@apollo/client'

const query = gql`
  query($id: ID!) {
    manuscript(id: $id) {
      id
      submission
      meta {
        title
        source
        manuscriptId
      }
      reviews {
        id
        updated
        isDecision
        canBePublishedPublicly
        decisionComment {
          id
          content
        }
        reviewComment {
          id
          content
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
`

export default query
