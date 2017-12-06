import React from 'react'
import Files from './Files'
import UploadingFile from '../atoms/UploadingFile'
import File from '../atoms/File'

const Supplementary = props => (
  <Files
    {...props}
    buttonText="↑ Upload files"
    uploadedFile={value => <File key={value.url} value={value} />}
    uploadingFile={({ file, progress, error }) => (
      <UploadingFile
        error={error}
        file={file}
        key={file.name}
        progress={progress}
      />
    )}
  />
)

export default Supplementary
