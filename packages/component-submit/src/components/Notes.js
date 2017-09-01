import React from 'react'
import { FormSection, Field } from 'redux-form'
import { NoteEditor } from 'xpub-edit'
import { ValidatedField } from 'xpub-ui'
import { required } from '../lib/validators'
import classes from './Metadata.local.scss'

const Notes = () => (
  <FormSection name="notes">
    <div className={classes.section} id="notes.fundingAcknowledgement">
      <Field
        name="fundingAcknowledgement"
        validate={[required]}
        component={props =>
          <ValidatedField {...props.meta}>
            <NoteEditor
              placeholder="Enter an acknowledgment…"
              title="Funding body acknowledgement"
              {...props.input}/>
          </ValidatedField>
        }/>
    </div>

    <div className={classes.section} id="notes.specialInstructions">
      <Field
        name="specialInstructions"
        component={props =>
          <ValidatedField {...props.meta}>
            <NoteEditor
              placeholder="Enter instructions for the editor…"
              title="Special instructions (confidential)"
              {...props.input}/>
          </ValidatedField>
        }/>
    </div>
  </FormSection>
)

export default Notes
