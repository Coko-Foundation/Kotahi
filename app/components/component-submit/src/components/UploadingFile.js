import React from 'react'
import styled from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'

const Icon = styled.div`
  background: ${th('colorFurniture')};
  height: calc(${th('gridUnit')} * 15);
  margin-bottom: ${th('gridUnit')};
  opacity: 0.5;
  position: relative;
  width: calc(${th('gridUnit')} * 9);
`

const Progress = styled.div`
  color: ${th('colorTextReverse')};
  display: block;
  position: absolute;
  bottom: ${th('gridUnit')};
  left: calc(${th('gridUnit')} * 4);
`

const Extension = styled.div`
  background: ${th('colorText')};
  color: ${th('colorTextReverse')};
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
  left: calc(${th('gridUnit')} * 2);
  position: absolute;
  right: 0;
  text-align: center;
  text-transform: uppercase;
  top: calc(${th('gridUnit')} * 2);
`

const Filename = styled.div`
  color: ${th('colorText')};
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
  font-style: italic;
  max-width: calc(${th('gridUnit')} * 30);
`

const Uploading = styled.div`
  align-items: center;
  display: inline-flex;
  flex-direction: column;
  margin-bottom: calc(${th('gridUnit')} * 3);
  margin-right: calc(${th('gridUnit')} * 3);
  position: relative;
  width: calc(${th('gridUnit')} * 30);
`

const Uploaded = styled(Uploading)`
  &::before,
  &::after {
    cursor: pointer;
    transition: transform ${th('transitionDuration')};
    font-size: ${th('fontSizeBaseSmall')};
    line-height: ${th('lineHeightBaseSmall')};
    left: 65%;
    padding: 0 ${th('gridUnit')} 0 ${th('gridUnit')};
    position: absolute;
    border: ${th('borderWidth')} ${th('borderStyle')} ${th('colorTextReverse')};
    color: ${th('colorTextReverse')};
    text-transform: uppercase;
    transform: scaleX(0);
    transform-origin: 0 0;
  }

  &::after {
    background: ${th('colorError')};
    content: 'Remove';
    top: calc(${th('gridUnit')} * 5);
    z-index: 2;
  }

  &::before {
    background: ${th('colorPrimary')};
    content: 'Replace';
    top: calc(${th('gridUnit')} * 10);
    z-index: 3;
  }

  &:hover ${Extension} {
    background: ${th('colorTextReverse')};
    color: ${th('colorPrimary')};
  }

  &:hover ${Icon} {
    opacity: 1;
    background: ${th('colorPrimary')};
    transform: skewY(6deg) rotate(-6deg);
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

const UploadingFile = ({ file, progress, error, uploaded }) => {
  const Root = uploaded ? Uploaded : Uploading

  return (
    <Root>
      {!!error && <ErrorWrapper>{error}</ErrorWrapper>}
      <Icon>
        {!!progress && <Progress>{progress * 100}%</Progress>}
        <Extension>{getFileExtension(file)}</Extension>
      </Icon>
      <Filename>
        {uploaded ? (
          <a download={file.name} href={file.url}>
            {file.name}
          </a>
        ) : (
          file.name
        )}
      </Filename>
    </Root>
  )
}

export default UploadingFile
