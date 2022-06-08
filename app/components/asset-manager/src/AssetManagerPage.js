/* eslint-disable no-console */
import React from 'react'
import { get } from 'lodash'
import { adopt } from 'react-adopt'
import { AssetManager } from './ui'
import {
  getEntityFilesQuery,
  getSpecificFilesQuery,
  uploadFilesMutation,
  deleteFilesMutation,
  updateFileMutation,
  filesUploadedSubscription,
  filesDeletedSubscription,
  fileUpdatedSubscription,
} from '../src/queries'

const mapper = {
  getEntityFilesQuery,
  getSpecificFilesQuery,
  filesUploadedSubscription,
  filesDeletedSubscription,
  fileUpdatedSubscription,
  uploadFilesMutation,
  deleteFilesMutation,
  updateFileMutation,
}

const mapProps = args => ({
  files: get(args.getEntityFilesQuery, 'data.getEntityFiles'),
  uploadFiles: (manuscriptId, files) => {
    const { uploadFilesMutation } = args
    const { uploadFiles } = uploadFilesMutation
    return uploadFiles({
      variables: {
        files,
        fileType: 'manuscriptImage',
        entityId: manuscriptId,
      },
    })
  },
  deleteFiles: ids => {
    const { deleteFilesMutation } = args
    const { deleteFiles } = deleteFilesMutation
    return deleteFiles({
      variables: {
        ids,
      },
    })
  },
  refetch: (manuscriptId, sortingParams) => {
    const { getEntityFilesQuery } = args
    const { refetch } = getEntityFilesQuery
    refetch({
      input: {
        entityId: manuscriptId,
        sortingParams,
        includeInUse: true,
      },
    })
  },
  updateFile: (fileId, data) => {
    const { updateFileMutation } = args
    const { updateFile } = updateFileMutation
    return updateFile({
      variables: {
        input: {
          id: fileId,
          ...data,
        },
      },
    })
  },
  refetching:
    args.getEntityFilesQuery.networkStatus === 4 ||
    args.getEntityFilesQuery.networkStatus === 2, // possible apollo bug
  loading: args.getEntityFilesQuery.networkStatus === 1,
})

const Composed = adopt(mapper, mapProps)

const Connected = props => {
  const { data, isOpen, hideModal } = props
  const { manuscriptId, withImport, handleImport } = data

  return (
    <Composed entityId={manuscriptId}>
      {({
        deleteFiles,
        files,
        loading,
        uploadFiles,
        updateFile,
        refetching,
        refetch,
      }) => (
        <AssetManager
          manuscriptId={manuscriptId}
          deleteFiles={deleteFiles}
          files={files}
          handleImport={handleImport}
          hideModal={hideModal}
          isOpen={isOpen}
          loading={loading}
          refetch={refetch}
          refetching={refetching}
          updateFile={updateFile}
          uploadFiles={uploadFiles}
          withImport={withImport}
        />
      )}
    </Composed>
  )
}

export default Connected
