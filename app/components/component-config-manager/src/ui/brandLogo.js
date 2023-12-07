/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import { Formik } from 'formik'
import { FilesUpload } from '../../../shared'
import { CompactSection } from '../../../component-cms-manager/src/style'

const setInitialValues = (existingConfig, selectedFile) => {
  const initialData = { ...existingConfig }

  if (Array.isArray(selectedFile) && selectedFile.length === 0) {
    initialData.logo = [initialData.logo]
  } else {
    initialData.logo = selectedFile || [initialData.logo]
  }

  return initialData
}

const FilesUploadWithOnChange = ({ handleFileChange, ...otherProps }) => {
  return (
    <CompactSection>
      <FilesUpload
        {...otherProps}
        onFileAdded={file => {
          handleFileChange(file)
        }}
        onFileRemoved={file => {
          handleFileChange(null)
        }}
      />
    </CompactSection>
  )
}

const BrandLogo = ({
  config,
  setLogoId,
  createFile,
  deleteFile,
  ...restProps
}) => {
  const [selectedFile, setSelectedFile] = useState([])
  const initialData = setInitialValues(config, selectedFile)

  const handleFileChange = file => {
    setLogoId(file?.id)
    setSelectedFile(file)
  }

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
        fieldName="logo"
        fileType="brandLogo"
        handleFileChange={handleFileChange}
        manuscriptId={config?.id}
        mimeTypesToAccept="image/*"
        setLogoId={setLogoId}
        {...restProps}
      />
    </Formik>
  )
}

export default BrandLogo
