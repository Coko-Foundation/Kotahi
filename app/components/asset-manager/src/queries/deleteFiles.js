import React from 'react'
import { Mutation } from '@apollo/client/react/components'
import { gql } from '@apollo/client'

const DELETE_FILES = gql`
  mutation DeleteFiles($ids: [ID!]!) {
    deleteFiles(ids: $ids)
  }
`

const deleteFilesMutation = props => {
  const { render } = props

  return (
    <Mutation mutation={DELETE_FILES}>
      {(deleteFiles, deleteFilesResult) =>
        render({ deleteFiles, deleteFilesResult })
      }
    </Mutation>
  )
}

export default deleteFilesMutation
