import React from 'react'
import { Mutation } from '@apollo/client/react/components'
import { gql } from '@apollo/client'

const UPLOAD_FILES = gql`
  mutation UploadFiles($files: [Upload]!, $fileType: String, $entityId: ID) {
    uploadFiles(files: $files, fileType: $fileType, entityId: $entityId) {
      id
    }
  }
`

const uploadFilesMutation = props => {
  const { render } = props

  return (
    <Mutation mutation={UPLOAD_FILES}>
      {(uploadFiles, uploadFilesResult) =>
        render({
          uploadFiles,
          uploadFilesResult,
        })
      }
    </Mutation>
  )
}

export { UPLOAD_FILES }
export default uploadFilesMutation
