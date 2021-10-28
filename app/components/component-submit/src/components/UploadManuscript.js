import React, { useContext } from 'react'
import styled, { css, keyframes, withTheme } from 'styled-components'
import { Icon, Action } from '@pubsweet/ui'
import { th } from '@pubsweet/ui-toolkit'
import { XpubContext } from '../../../xpub-with-context/src'
import upload from '../upload'
import { Dropzone } from '../../../shared'

const StatusIcon = withTheme(({ children, theme }) => (
  <Icon color={theme.colorPrimary}>{children}</Icon>
))

const Status = styled.div`
  align-items: center;
  color: ${th('colorPrimary')};
  display: inline-flex;
  margin-top: -2px;
`

const StatusIdle = styled(Status).attrs(props => ({
  children: <StatusIcon>plus_circle</StatusIcon>,
}))``

const spin = keyframes`
  0% {
    transform: rotate(0deg);
    transform-origin: 50% 50%;
  }

  100% {
    transform: rotate(360deg);
    transform-origin: 50% 50%;
  }
`

const StatusConverting = styled(Status).attrs(props => ({
  children: <StatusIcon>plus_circle</StatusIcon>,
}))`
  &:hover {
    cursor: wait;
  }

  line {
    stroke-linejoin: round;
  }

  circle {
    animation: ${spin} 2s infinite linear;
    stroke-dasharray: 16;
    stroke-dashoffset: 0;
    stroke-linejoin: round;
  }
`

const StatusError = styled(Status).attrs(props => ({
  children: <StatusIcon>plus_circle</StatusIcon>,
}))`
  color: ${th('colorDanger')};
  font-size: 1.5em;
  font-style: italic;
  font-weight: 400;

  .icon circle {
    display: none;
  }

  .icon line {
    stroke: ${th('colorDanger')};
    transform: rotate(45deg) scale(2.8);
    transform-origin: 50% 50%;
  }
`

const dash = keyframes`
  from {
    stroke-dashoffset: -100;
  }

  to {
    stroke-dashoffset: 0;
  }
`

const StatusCompleted = styled(Status).attrs(props => ({
  children: <StatusIcon>check_circle</StatusIcon>,
}))`
  polyline {
    animation: ${dash} 1.35s linear;
    stroke-dasharray: 100;
    stroke-dashoffset: 0;
  }

  path {
    animation: ${dash} 0.75s linear;
    stroke-dasharray: 100;
    stroke-dashoffset: 0;
  }
`

const Root = styled.div`
  display: flex;
  flex-direction: column;
  font-weight: 200;
  padding-bottom: 10px;
  padding-top: 10px;

  &:hover ${StatusIdle} {
    circle {
      fill: ${th('colorPrimary')};
      stroke: ${th('colorPrimary')};
    }

    line {
      stroke: white;
    }
  }
`

const Main = styled.div`
  display: flex;
  justify-content: center;
`

const Error = styled.div`
  color: ${th('colorDanger')};
  font-size: 1.5em;
  font-style: italic;
  font-weight: 400;
`

const Info = styled.div`
  color: ${th('colorPrimary')};
  font-size: 2em;
  font-weight: 400;

  ${props =>
    !props.completed &&
    css`
      cursor: default;
    `}
`

const SubInfo = styled.div`
  color: #333;
  line-height: 32px;
  text-align: center;
`

const UploadManuscript = ({ acceptFiles, ...props }) => {
  const { client, history, journals, currentUser } = props

  // const [error, setError] = useState(false)
  // const [completed, setCompleted] = useState(false)
  const [conversion, setConversion] = useContext(XpubContext)
  const { error, completed, converting } = conversion

  // const error = conversion.error
  // const
  // setConversion({ error: 'yes' })

  const uploadManuscript = upload({
    client,
    history,
    journals,
    currentUser,
    setConversion,
  })

  // const status = completed
  //   ? 'completed'
  //   : error
  //   ? 'error'
  //   : conversion.converting
  //   ? 'converting'
  //   : 'idle'

  // if (!completed && !conversion.converting) {
  //   setCompleted(true)
  //   setError(false)
  // }

  // Show and then hide the error/success state
  if (error || completed) {
    setTimeout(() => {
      setConversion({})
    }, 3000)
  }

  return (
    <>
      <Dropzone
        accept={acceptFiles}
        data-testid="dropzone"
        disableUpload={converting ? 'disableUpload' : null}
        onDrop={uploadManuscript}
      >
        {({ getRootProps, getInputProps }) => (
          <Root {...getRootProps()}>
            <Main>
              <input {...getInputProps()} />
              {completed && <StatusCompleted />}
              {error && <StatusError />}
              {converting && <StatusConverting />}
              {!converting && !error && !completed && <StatusIdle />}
              {error ? (
                <Error>{error.message}</Error>
              ) : (
                <Info completed={completed}>
                  {completed ? 'Submission created' : 'Upload Manuscript'}
                </Info>
              )}
            </Main>
            <SubInfo>
              {converting &&
                'Your manuscript is being converted into a directly editable version. This might take a few seconds.'}
              {!converting && (
                <>
                  <p>Drag and drop or click to select file</p>
                  <em>Accepted file types: pdf, epub, zip, docx, latex</em>
                </>
              )}
            </SubInfo>
          </Root>
        )}
      </Dropzone>
      <Action onClick={() => uploadManuscript()}>Submit a URL instead</Action>
    </>
  )
}

export default UploadManuscript
