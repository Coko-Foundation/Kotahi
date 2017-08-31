import React from 'react'
import { FormSection, Field } from 'redux-form'
import { NoteEditor } from 'xpub-edit'
import classes from './Metadata.local.css'

const Notes = () => (
  <FormSection name="notes">
    <div className={classes.section} id="notes.fundingAcknowledgement">
      <Field
        name="fundingAcknowledgement"
        component={props =>
          <NoteEditor
            placeholder="Enter an acknowledgment…"
            title="Funding body acknowledgement"
            {...props.input}/>
        }/>
    </div>

    <div className={classes.section} id="notes.specialInstructions">
      <Field
        name="specialInstructions"
        component={props =>
          <NoteEditor
            placeholder="Enter instructions for the editor…"
            title="Special instructions (confidential)"
            {...props.input}/>
        }/>
    </div>
  </FormSection>
)

export default Notes
