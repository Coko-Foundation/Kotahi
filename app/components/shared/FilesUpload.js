import React from 'react'
import { cloneDeep } from 'lodash'
import { FieldArray } from 'formik'
import { grid, th } from '@pubsweet/ui-toolkit'
import styled from 'styled-components'
import { useMutation, gql } from '@apollo/client'
import UploadingFile from './UploadingFile'
import { Dropzone } from './Dropzone'
import { Icon } from './Icon'

const Root = styled.div`
  border: 1px dashed ${th('colorBorder')};
  height: ${grid(8)};
  border-radius: ${th('borderRadius')};
  text-align: center;
  line-height: ${grid(8)};
`

const Files = styled.div`
  margin-top: ${grid(2)};
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-gap: ${grid(2)};
`

const Message = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  svg {
    margin-left: ${grid(1)};
  }
`

const createFileMutation = gql`
  mutation($file: Upload!, $meta: FileMetaInput) {
    createFile(file: $file, meta: $meta) {
      id
      created
      label
      filename
      fileType
      mimeType
      size
      url
    }
  }
`

const DropzoneAndList = ({
  form: { values, setFieldValue },
  push,
  insert,
  createFile,
  deleteFile,
  fileType,
}) => (
  <>
    <Dropzone
      onDrop={async files => {
        Array.from(files).forEach(async file => {
          const data = await createFile(file)
          push(data.createFile)
        })
      }}
    >
      {({ getRootProps, getInputProps }) => (
        <Root {...getRootProps()}>
          <input {...getInputProps()} />
          <Message>
            Drag and drop your files here
            <Icon color={th('colorPrimary')} inline>
              file-plus
            </Icon>
          </Message>
        </Root>
      )}
    </Dropzone>
    <Files>
      {cloneDeep(values.files || [])
        .filter(val => val.fileType === fileType)
        .map(val => {
          val.name = val.filename
          return <UploadingFile file={val} key={val.name} uploaded />
        })}
    </Files>
  </>
)

const FilesUpload = ({
  objectId,
  objectType,
  fileType,
  manuscriptId,
  reviewCommentId,
}) => {
  const [createFile] = useMutation(createFileMutation)
  // const [deleteFile] = useMutation(deleteFileMutation)

  if (manuscriptId) {
    reviewCommentId = null
  }

  const createFileWithMeta = async file => {
    const meta = {
      filename: file.name,
      mimeType: file.type,
      size: file.size,
      fileType,
      manuscriptId, // one of these two will be null
      reviewCommentId,
    }

    const { data } = await createFile({
      variables: {
        file,
        meta,
      },
    })
    return data
  }

  return (
    <FieldArray
      name="files"
      render={formikProps => (
        <DropzoneAndList
          createFile={createFileWithMeta}
          // deleteFile={deleteFile}
          fileType={fileType}
          {...formikProps}
        />
      )}
    />
  )
}
export { FilesUpload }
