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
