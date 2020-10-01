import React from 'react'
import styled from 'styled-components'
import { Action } from '@pubsweet/ui'
import { th, grid } from '@pubsweet/ui-toolkit'

const Icon = styled.div`
  background: ${th('colorFurniture')};
  height: ${grid(10)};
  margin-bottom: ${th('gridUnit')};
  opacity: 0.5;
  position: relative;
  width: ${grid(10)};
  overflow: hidden;
  padding: ${grid(1)};
  img {
    width: ${grid(8)};
  }
`

// const Progress = styled.div`
//   color: ${th('colorTextReverse')};
//   display: block;
//   position: absolute;
//   bottom: ${th('gridUnit')};
//   left: ${grid(4)};
// `

const Extension = styled.div`
  background: ${th('colorText')};
  color: ${th('colorTextReverse')};
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
  left: ${grid(2)};
  position: absolute;
  right: 0;
  text-align: center;
  text-transform: uppercase;
  top: ${grid(2)};
`

const Filename = styled.div`
  color: ${th('colorText')};
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
  font-style: italic;
  max-width: ${grid(30)};
  text-overflow: ellipsis;
  overflow: hidden;
`

const Uploading = styled.div`
  align-items: center;
  display: block;
  flex-direction: column;
  margin-bottom: ${grid(3)};
  margin-right: ${grid(3)};
  position: relative;
`

const Uploaded = styled(Uploading)`
  &:hover ${Extension} {
    background: ${th('colorTextReverse')};
    color: ${th('colorPrimary')};
  }

  &:hover ${Icon} {
    opacity: 1;
    background: ${th('colorPrimary')};
    // transform: skewY(6deg) rotate(-6deg);
  }

  &:hover::after,
  &:hover::before {
    transform: scaleX(1);
  }
`

const ErrorWrapper = styled.div`
  background: ${th('colorError')};
  border: calc(${th('borderWidth')} * 2) ${th('borderStyle')}
    ${th('colorTextReverse')};
  color: ${th('colorTextReverse')};
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
  letter-spacing: 0.01em;
  opacity: 1;
  padding: ${th('gridUnit')} ${th('gridUnit')};
  position: absolute;
  top: 25%;
  z-index: 4;
`

const getFileExtension = ({ name }) => name.replace(/^.+\./, '')

const UploadingFile = ({
  file,
  progress,
  error,
  deleteFile,
  uploaded,
  index,
  remove,
}) => {
  const Root = uploaded ? Uploaded : Uploading

  const extension = getFileExtension(file)
  const isImage = file?.mimeType.startsWith('image/')

  return (
    <Root>
      {!!error && <ErrorWrapper>{error}</ErrorWrapper>}
      <Icon>
        {isImage && <img alt={file.name} src={file.url} />}
        {/* {!!progress && <Progress>{progress * 100}%</Progress>} */}
        <Extension>{extension}</Extension>
      </Icon>
      <Filename>
        {uploaded ? (
          <a download={file.name} href={file.url} title={file.name}>
            {file.name}
          </a>
        ) : (
          file.name
        )}
      </Filename>

      <Action onClick={() => deleteFile(file, index, remove)}>Remove</Action>
    </Root>
  )
}

export default UploadingFile
