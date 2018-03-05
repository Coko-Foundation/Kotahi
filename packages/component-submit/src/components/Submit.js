import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { Button, th } from '@pubsweet/ui'
import Metadata from './Metadata'
import Declarations from './Declarations'
import Suggestions from './Suggestions'
import Notes from './Notes'
import SupplementaryFiles from './SupplementaryFiles'
import Confirm from './Confirm'
import { Heading1 } from '../styles'
// import Validots from './Validots'

const Wrapper = styled.div`
  font-family: ${th('fontInterface')};
  line-height: 1.3;
  margin: auto;
  max-width: 60em;

  overflow: ${({ confirming }) => confirming && 'hidden'};
`

const Intro = styled.div`
  font-style: italic;
  line-height: 1.4;
`

const ModalWrapper = styled.div`
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  bottom: 0;
  display: flex;
  justify-content: center;
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
`

const Submit = ({
  project,
  version,
  valid,
  error,
  readonly,
  handleSubmit,
  uploadFile,
  confirming,
  toggleConfirming,
}) => (
  <Wrapper>
    <Heading1>Submission information</Heading1>

    <Intro>
      <div>
        We have ingested your manuscript. To access your manuscript in an
        editor, please{' '}
        <Link to={`/projects/${project.id}/versions/${version.id}/manuscript`}>
          view here
        </Link>.
      </div>
      <div>
        To complete your submission, please answer the following questions.
      </div>
      <div>The answers will be automatically saved.</div>
    </Intro>

    <form onSubmit={handleSubmit}>
      <Metadata readonly={readonly} />
      <Declarations readonly={readonly} />
      <Suggestions readonly={readonly} />
      <Notes readonly={readonly} />
      <SupplementaryFiles readonly={readonly} uploadFile={uploadFile} />

      {!readonly && (
        <div>
          <Button onClick={toggleConfirming} primary type="button">
            Submit your manuscript
          </Button>
        </div>
      )}

      {confirming && (
        <ModalWrapper>
          <Confirm toggleConfirming={toggleConfirming} />
        </ModalWrapper>
      )}
    </form>

    {/* <div className={classes.validots}>
      <Validots
        valid={valid}
        handleSubmit={handleSubmit}/>
    </div> */}
  </Wrapper>
)

export default Submit
