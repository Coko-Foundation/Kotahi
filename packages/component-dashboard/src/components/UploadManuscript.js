import React, { Component } from 'react'
import styled, { keyframes } from 'styled-components'
import Dropzone from 'react-dropzone'
import { Icon } from '@pubsweet/ui'

const StyledDropzone = styled(Dropzone)`
  border: none;
  cursor: pointer;
  display: inline-block;
`

const StatusIcon = ({ children }) => (
  <Icon color="var(--color-primary)">{children}</Icon>
)

const Status = styled.div`
  align-items: center;
  color: var(--color-primary);
  display: inline-flex;
`

const StatusIdle = Status.extend.attrs({
  children: () => <StatusIcon>plus_circle</StatusIcon>,
})``

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

const StatusConverting = Status.extend.attrs({
  children: () => <StatusIcon>plus_circle</StatusIcon>,
})`
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

const StatusError = Status.extend.attrs({
  children: () => <StatusIcon>plus_circle</StatusIcon>,
})`
  color: var(--color-danger);
  font-size: 1.5em;
  font-style: italic;
  font-weight: 400;

  .icon circle {
    display: none;
  }

  .icon line {
    stroke: var(--color-danger);
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

const StatusCompleted = Status.extend.attrs({
  children: () => <StatusIcon>check_circle</StatusIcon>,
})`
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
  font-weight: 200;
  padding-bottom: 10px;
  padding-top: 10px;

  &:hover ${StatusIdle} {
    circle {
      fill: var(--color-primary);
      stroke: var(--color-primary);
    }

    line {
      stroke: white;
    }
  }
`

const Main = styled.div`
  margin-left: 10px;
`

const Error = styled.div`
  color: var(--color-danger);
  font-size: 1.5em;
  font-style: italic;
  font-weight: 400;
`

const Info = styled.div`
  color: var(--color-primary);
  font-size: 2em;
  font-weight: 400;
  text-transform: uppercase;
`

class UploadManuscript extends Component {
  constructor(props) {
    super(props)
    this.state = {
      completed: false,
      error: false,
    }
    this.showErrorAndHide = this.showErrorAndHide.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.conversion.converting !== nextProps.conversion.converting &&
      this.props.conversion.converting === true
    ) {
      this.setState({
        completed: true,
        error: false,
      })
    }

    if (nextProps.conversion.error !== undefined) {
      this.showErrorAndHide()
    }
  }

  showErrorAndHide() {
    this.setState({
      error: true,
      completed: false,
    })
    setTimeout(() => {
      this.setState({
        error: false,
        completed: false,
      })
    }, 3000)
  }

  get status() {
    if (this.state.completed) {
      return 'completed'
    }
    if (this.state.error) {
      return 'error'
    }
    if (this.props.conversion.converting) {
      return 'converting'
    }
    return 'idle'
  }

  render() {
    const { uploadManuscript, conversion } = this.props

    return (
      <StyledDropzone
        accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onDrop={uploadManuscript}
      >
        <Root>
          {this.status === 'completed' && <StatusCompleted />}
          {this.status === 'error' && <StatusError />}
          {this.status === 'converting' && <StatusConverting />}
          {this.status === 'idle' && <StatusIdle />}

          <Main>
            {this.state.error ? (
              <Error>{conversion.error.message}</Error>
            ) : (
              <Info>
                {this.state.completed
                  ? 'Submission created'
                  : 'Create submission'}
              </Info>
            )}
          </Main>
        </Root>
      </StyledDropzone>
    )
  }
}

export default UploadManuscript
