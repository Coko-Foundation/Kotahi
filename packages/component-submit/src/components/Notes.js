import React from 'react'
import { FormSection } from 'redux-form'
import { NoteEditor } from 'xpub-edit'
import { ValidatedField } from 'xpub-ui'
import { required } from 'xpub-validators'
import classes from './Metadata.local.scss'

const FundingInput = input => (
  <NoteEditor
    placeholder="Enter an acknowledgment…"
    title="Funding body acknowledgement (required)"
    {...input}
  />
)

const InstructionsInput = input => (
  <NoteEditor
    placeholder="Enter instructions for the editor…"
    title="Special instructions (confidential)"
    {...input}
  />
)

const Notes = () => (
  <FormSection name="notes">
    <div className={classes.section} id="notes.fundingAcknowledgement">
      <ValidatedField
        component={FundingInput}
        name="fundingAcknowledgement"
        validate={[required]}
      />
    </div>

    <div className={classes.section} id="notes.specialInstructions">
      <ValidatedField
        component={InstructionsInput}
        name="specialInstructions"
      />
    </div>
  </FormSection>
)

export default Notes
