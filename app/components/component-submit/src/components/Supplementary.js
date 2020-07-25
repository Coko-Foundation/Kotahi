import React from 'react'
import { cloneDeep } from 'lodash'
import { FieldArray } from 'formik'
import { Flexbox, UploadButton, UploadingFile } from '@pubsweet/ui'

const renderFilesUpload = (onChange, createSupplementaryFile) => ({
  form: { values, setFieldValue },
  push,
  insert,
}) => (
  <>
    <UploadButton
      buttonText="↑ Upload files"
      onChange={event => {
        const fileArray = Array.from(event.target.files).map(file => {
          const fileUpload = {
            fileType: 'supplementary',
            filename: file.name,
          }
          return fileUpload
        })
        setFieldValue('files', fileArray.concat(values.files))
        Array.from(event.target.files).forEach(file => {
          createSupplementaryFile(file)
        })
      }}
    />
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

const Supplementary = ({ onChange, createSupplementaryFile }) => (
  <FieldArray
    name="files"
    render={renderFilesUpload(onChange, createSupplementaryFile)}
  />
)

export default Supplementary
