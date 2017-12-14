import React from 'react'
import { FormSection } from 'redux-form'
import { NoteEditor } from 'xpub-edit'
import { ValidatedField } from '@pubsweet/ui'
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

const Notes = ({ readonly }) => (
  <FormSection name="notes">
    <div className={classes.section} id="notes.fundingAcknowledgement">
      <ValidatedField
        component={FundingInput}
        name="fundingAcknowledgement"
        readonly={readonly}
        validate={[required]}
      />
    </div>

    <div className={classes.section} id="notes.specialInstructions">
      <ValidatedField
        component={InstructionsInput}
        name="specialInstructions"
        readonly={readonly}
      />
    </div>
  </FormSection>
)

export default Notes
