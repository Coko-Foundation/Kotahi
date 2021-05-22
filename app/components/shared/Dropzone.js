import React from 'react'
import styled from 'styled-components'
import ReactDropzone from 'react-dropzone'

// eslint-disable-next-line import/prefer-default-export
export const Dropzone = styled(({ disableUpload, ...props }) => (
  <ReactDropzone {...props} />
))`
  border: none;
  cursor: pointer;
  ${({ disableUpload }) => disableUpload && 'pointer-events: none;'};
`
