import React from 'react'
import { Mutation } from '@apollo/client/react/components'
import { gql } from '@apollo/client'

const UPDATE_FILE = gql`
  mutation UpdateFile($input: UpdateFileInput!) {
    updateFile(input: $input) {
      id
    }
  }
`

const updateFileMutation = props => {
  const { render } = props

  return (
    <Mutation mutation={UPDATE_FILE}>
      {(updateFile, updateFileResult) =>
        render({
          updateFile,
          updateFileResult,
        })
      }
    </Mutation>
  )
}

export default updateFileMutation
