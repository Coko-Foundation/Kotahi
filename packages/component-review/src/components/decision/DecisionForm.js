import React from 'react'
import { FormSection } from 'redux-form'
import { Button } from 'xpub-ui'
import { NoteEditor } from 'xpub-edit'
import { Attachments, RadioGroup, ValidatedField } from 'xpub-ui'
import { withJournal } from 'xpub-journal'
import { required } from '../../lib/validators'
import classes from './DecisionForm.local.scss'

const DecisionForm = ({journal, valid, handleSubmit, uploadFile }) => {
  const NoteInput = input =>
    <NoteEditor
      title="Decision"
      placeholder="Enter your decision…"
      {...input}/>

  const AttachmentsInput = input =>
    <Attachments
      uploadFile={uploadFile}
      {...input}/>

  const RecommendationInput = input =>
    <RadioGroup
      inline
      required
      options={journal.recommendations}
      {...input}/>

  return (
    <form onSubmit={handleSubmit}>
      <div className={classes.section}>
        <FormSection name="note">
          <div className={classes.note}>
            <div className={classes.content}>
              <ValidatedField
                name="content"
                validate={[required]}
                component={NoteInput}/>
            </div>

            <ValidatedField
              name="attachments"
              component={AttachmentsInput}/>
          </div>
        </FormSection>
      </div>

      <div className={classes.section}>
        <ValidatedField
          name="recommendation"
          validate={[required]}
          component={RecommendationInput}/>
      </div>

      <div>
        {/*<Button type="button" onClick={handleSave}>Save</Button>*/}
        <Button type="submit" primary>Submit</Button>
      </div>
    </form>
  )
}

export default withJournal(DecisionForm)
