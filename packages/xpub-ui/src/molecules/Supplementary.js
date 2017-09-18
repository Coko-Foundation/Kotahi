import React from 'react'
import Files from './Files'
import UploadingFile from '../atoms/UploadingFile'
import File from '../atoms/File'

const Supplementary = props => (
  <Files
    {...props}
    buttonText="▲ Upload files"
    uploadingFile={({ file, progress, error }) => (
      <UploadingFile
        key={file.name}
        file={file}
        progress={progress}
        error={error}/>
    )}
    uploadedFile={value => (
      <File
        key={value.url}
        value={value}/>
    )}/>
)

export default Supplementary
