import { gql } from '@apollo/client'

const query = gql`
  query($id: ID!) {
    manuscript(id: $id) {
      submission
    }
  }
`

export default query
