import React from 'react'
import { FormSection } from 'redux-form'
import { NoteEditor } from 'xpub-edit'
import { ValidatedField } from 'xpub-ui'
import { required } from '../lib/validators'
import classes from './Metadata.local.scss'

const Notes = () => {
  const FundingInput = input =>
    <NoteEditor
      placeholder="Enter an acknowledgment…"
      title="Funding body acknowledgement"
      {...input}/>

  const InstructionsInput = input =>
    <NoteEditor
      placeholder="Enter instructions for the editor…"
      title="Special instructions (confidential)"
      {...input}/>

  return (
    <FormSection name="notes">
      <div className={classes.section} id="notes.fundingAcknowledgement">
        <ValidatedField
          name="fundingAcknowledgement"
          validate={[required]}
          component={FundingInput}/>
      </div>

      <div className={classes.section} id="notes.specialInstructions">
        <ValidatedField
          name="specialInstructions"
          component={InstructionsInput}/>
      </div>
    </FormSection>
  )
}

export default Notes
