import React, { useContext } from 'react'
import styled, { keyframes, withTheme } from 'styled-components'
import { XpubContext } from 'xpub-with-context'
import Dropzone from 'react-dropzone'
import { Icon } from '@pubsweet/ui'
import { th } from '@pubsweet/ui-toolkit'
import upload from '../upload'

const StyledDropzone = styled(({ disableUpload, ...props }) => (
  <Dropzone {...props} />
))`
  border: none;
  cursor: pointer;
  display: inline-block;
  ${({ disableUpload }) => disableUpload && 'pointer-events: none;'};
`

const StatusIcon = withTheme(({ children, theme }) => (
  <Icon color={theme.colorPrimary}>{children}</Icon>
))

const Status = styled.div`
  align-items: center;
  color: ${th('colorPrimary')};
  display: inline-flex;
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
  margin-left: 10px;
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
  text-transform: uppercase;
`

const SubInfo = styled.div`
  display: flex;
  justify-content: center;
  color: #333;
  line-height: 32px;
`

const UploadManuscript = ({ acceptFiles, ...props }) => {
  // const [error, setError] = useState(false)
  // const [completed, setCompleted] = useState(false)
  const [conversion, setConversion] = useContext(XpubContext)
  const { error, completed, converting } = conversion

  // const error = conversion.error
  // const
  // setConversion({ error: 'yes' })

  const uploadManuscript = upload({
    client: props.client,
    history: props.history,
    journals: props.journals,
    currentUser: props.currentUser,
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

  // Show and then hide the error
  if (error) {
    setTimeout(() => {
      setConversion({})
    }, 3000)
  }

  return (
    <StyledDropzone
      accept={acceptFiles}
      disableUpload={converting ? 'disableUpload' : null}
      onDrop={uploadManuscript}
      data-testid="dropzone"
    >
      <Root>
        <Main>
          {completed && <StatusCompleted />}
          {error && <StatusError />}
          {converting && <StatusConverting />}
          {!converting && !error && !completed && <StatusIdle />}
          {error ? (
            <Error>{error.message}</Error>
          ) : (
            <Info>
              {completed ? 'Submission created' : 'Submit Manuscript'}
            </Info>
          )}
        </Main>
        <SubInfo>
          {converting &&
            'Your manuscript is being converted into a directly editable version. This might take a few seconds.'}
          {!converting && 'Accepted file types: pdf, epub, zip, docx, latex'}
        </SubInfo>
      </Root>
    </StyledDropzone>
  )
}

export default UploadManuscript

// class UploadManuscript extends Component {

// constructor(props) {
//   super(props)
//   this.state = {
//     completed: false,
//     error: false,
//   }
//   this.showErrorAndHide = this.showErrorAndHide.bind(this)
// }

// getDerivedPropsFromState(props, state) {
// if (!state.completed && !props.conversion.converting) {
//   this.setState({
//     completed: true,
//     error: false,
//   })
// }

//   if (props.conversion.error) {
//     this.showErrorAndHide()
//   }
// }

// showErrorAndHide() {
//   this.setState({
//     error: true,
//     completed: false,
//   })
//   setTimeout(() => {
//     this.setState({
//       error: false,
//       completed: false,
//     })
//   }, 3000)
// }

// get status() {
//   if (this.state.completed) {
//     return 'completed'
//   }
//   if (this.state.error) {
//     return 'error'
//   }
//   if (this.props.conversion.converting) {
//     return 'converting'
//   }
//   return 'idle'
// }

// render() {
// const { acceptFiles, uploadManuscript, conversion } = this.props

// return (
//   <StyledDropzone
//     accept={acceptFiles}
//     disableUpload={this.status === 'converting' ? 'disableUpload' : null}
//     onDrop={uploadManuscript}
//   >
//     <Root>
//       <Main>
//         {this.status === 'completed' && <StatusCompleted />}
//         {this.status === 'error' && <StatusError />}
//         {this.status === 'converting' && <StatusConverting />}
//         {this.status === 'idle' && <StatusIdle />}
//         {this.state.error ? (
//           <Error>{conversion.error.message}</Error>
//         ) : (
//           <Info>
//             {this.state.completed
//               ? 'Submission created'
//               : 'Submit Manuscript'}
//           </Info>
//         )}
//       </Main>
//       <SubInfo>
//         {this.status === 'converting' &&
//           'Your manuscript is being converted into a directly editable version. This might take a while.'}
//         {this.status !== 'converting' &&
//           'Accepted file types: pdf, epub, zip, docx, latex'}
//       </SubInfo>
//     </Root>
//   </StyledDropzone>
// )
// }
// }

// export default UploadManuscript
