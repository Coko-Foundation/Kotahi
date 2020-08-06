import React from 'react'
import { cloneDeep } from 'lodash'
import { FieldArray } from 'formik'
import { Flexbox } from '@pubsweet/ui'
import styled from 'styled-components'
import UploadingFile from './UploadingFile'
import { Dropzone } from '../../../shared'

const Root = styled.div``
const renderFilesUpload = createSupplementaryFile => ({
  form: { values, setFieldValue },
  push,
  insert,
}) => (
  <>
    <Dropzone
      onDrop={async files => {
        Array.from(files).forEach(async file => {
          const data = await createSupplementaryFile(file)
          push(data.createFile)
        })
      }}
    >
      {({ getRootProps, getInputProps }) => (
        <Root {...getRootProps()}>
          <input {...getInputProps()} />
          <p>Your files here</p>
        </Root>
      )}
    </Dropzone>
    <Flexbox>
      {cloneDeep(values.files || [])
        .filter(val => val.fileType === 'supplementary')
        .map(val => {
          val.name = val.filename
          return <UploadingFile file={val} key={val.name} uploaded />
        })}
    </Flexbox>
  </>
)

const Supplementary = ({ createSupplementaryFile }) => (
  <FieldArray
    name="files"
    render={renderFilesUpload(createSupplementaryFile)}
  />
)

export default Supplementary
