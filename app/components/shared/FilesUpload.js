import React from 'react'
import { cloneDeep, get } from 'lodash'
import { FieldArray } from 'formik'
import { grid, th } from '@pubsweet/ui-toolkit'
import styled from 'styled-components'
import { useMutation, gql } from '@apollo/client'
import UploadingFile from './UploadingFile'
import { Dropzone } from './Dropzone'
import { Icon } from './Icon'
import theme from '../../theme'

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
  color: ${props => (props.disabled ? th('colorTextPlaceholder') : 'inherit')};
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

const deleteFileMutation = gql`
  mutation($id: ID!) {
    deleteFile(id: $id)
  }
`

const DropzoneAndList = ({
  form: { values, setFieldValue },
  push,
  insert,
  remove,
  createFile,
  deleteFile,
  fileType,
  fieldName,
  multiple,
  accept,
}) => {
  // Disable the input in case we want a single file upload
  // and a file has already been uploaded
  const files = cloneDeep(get(values, fieldName) || [])
    .map((file, index) => {
      // This is so that we preserve the location of the file in the top-level
      // files array (needed for deletion).
      file.originalIndex = index
      return file
    })
    .filter(val => (fileType ? val.fileType === fileType : true))
    .map(val => {
      val.name = val.filename
      return val
    })

  const disabled = !multiple && files.length

  return (
    <>
      <Dropzone
        accept={accept}
        disabled={disabled}
        multiple={multiple}
        onDrop={async files => {
          Array.from(files).forEach(async file => {
            const data = await createFile(file)
            push(data.createFile)
          })
        }}
      >
        {({ getRootProps, getInputProps }) => (
          <Root {...getRootProps()} data-testid="dropzone">
            <input {...getInputProps()} />
            <Message disabled={disabled}>
              {disabled ? (
                'Your file has been uploaded.'
              ) : (
                <>
                  Drag and drop your files here
                  <Icon color={theme.colorPrimary} inline>
                    file-plus
                  </Icon>
                </>
              )}
            </Message>
          </Root>
        )}
      </Dropzone>
      <Files>
        {files.map(file => (
          <UploadingFile
            deleteFile={deleteFile}
            file={file}
            index={file.originalIndex}
            key={file.name}
            remove={remove}
            uploaded
          />
        ))}
      </Files>
    </>
  )
}
const FilesUpload = ({
  fileType,
  fieldName = 'files',
  containerId,
  containerName,
  initializeContainer,
  multiple = true,
  accept,
}) => {
  const [createF] = useMutation(createFileMutation)
  const [deleteF] = useMutation(deleteFileMutation, {
    update(cache, { data: { deleteFile } }) {
      const id = cache.identify({
        __typename: 'File',
        id: deleteFile,
      })
      cache.evict({ id })
    },
  })

  const createFile = async file => {
    const meta = {
      filename: file.name,
      mimeType: file.type,
      size: file.size,
      fileType,
    }

    // Create a container/parent for these files if one doesn't exist
    const localContainerId = containerId || (await initializeContainer())

    meta[`${containerName}Id`] = localContainerId

    const { data } = await createF({
      variables: {
        file,
        meta,
      },
    })
    return data
  }

  const deleteFile = async (file, index, remove) => {
    const { data } = await deleteF({ variables: { id: file.id } })
    remove(index)
    return data
  }

  return (
    <FieldArray
      name={fieldName}
      render={formikProps => (
        <DropzoneAndList
          accept={accept}
          createFile={createFile}
          deleteFile={deleteFile}
          fieldName={fieldName}
          fileType={fileType}
          multiple={multiple}
          {...formikProps}
        />
      )}
    />
  )
}
export { FilesUpload }
