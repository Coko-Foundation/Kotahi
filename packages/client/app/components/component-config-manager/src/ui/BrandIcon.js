/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import { Formik } from 'formik'
import { FilesUpload } from '../../../shared'
import { CompactSection } from '../../../component-cms-manager/src/style'

const setInitialValues = (
  existingConfig,
  selectedFile,
  fieldName,
  setFileId,
) => {
  const initialData = { ...existingConfig }

  if (selectedFile?.length < 1) {
    initialData[fieldName] = [initialData[fieldName]]
    setFileId(initialData[fieldName][0]?.id)
  } else {
    initialData[fieldName] = selectedFile
    setFileId(selectedFile?.id)
  }

  return initialData
}

const FilesUploadWithOnChange = ({ handleFileChange, ...otherProps }) => (
  <CompactSection>
    <FilesUpload
      {...otherProps}
      onFileAdded={file => handleFileChange(file)}
      onFileRemoved={() => handleFileChange(null)}
    />
  </CompactSection>
)

const BrandIcon = ({
  config,
  setFileId,
  createFile,
  fieldName,
  fileType,
  deleteFile,
  mimeTypesToAccept,
  ...restProps
}) => {
  const [selectedFile, setSelectedFile] = useState([])

  const handleFileChange = file => {
    setFileId(file?.id)
    setSelectedFile(file)
  }

  const initialData = setInitialValues(
    config,
    selectedFile,
    fieldName,
    setFileId,
  )

  return (
    <Formik
      initialValues={initialData}
      onSubmit={actions => {
        actions.setSubmitting(false)
      }}
    >
      <FilesUploadWithOnChange
        acceptMultiple={false}
        confirmBeforeDelete
        createFile={createFile}
        deleteFile={deleteFile}
        fieldName={fieldName}
        fileType={fileType}
        handleFileChange={handleFileChange}
        manuscriptId={config?.id}
        mimeTypesToAccept={mimeTypesToAccept}
        {...restProps}
      />
    </Formik>
  )
}

export default BrandIcon
