import React from 'react'
import { ApolloConsumer, gql } from '@apollo/client'

const GET_SPECIFIC_FILES = gql`
  query GetSpecificFilesQuery($ids: [ID!]!) {
    getSpecificFiles(ids: $ids) {
      id
      name
      alt
      objectId
      updated
      storedObjects {
        type
        key
        mimetype
        size
        url
        imageMetadata {
          width
          height
          space
          density
        }
      }
    }
  }
`

const getSpecificFilesQuery = props => {
  const { render } = props
  return (
    <ApolloConsumer>
      {client => render({ client, query: GET_SPECIFIC_FILES })}
    </ApolloConsumer>
  )
}

export { GET_SPECIFIC_FILES }
export default getSpecificFilesQuery
