import React from 'react'
import { FormSection } from 'redux-form'
import { Button } from 'xpub-ui'
import { NoteEditor } from 'xpub-edit'
import { Attachments, RadioGroup, ValidatedField } from 'xpub-ui'
import { withJournal } from 'xpub-journal'
import { required } from 'xpub-validators'
import classes from './ReviewForm.local.scss'

const NoteInput = input =>
  <NoteEditor
    title="Review"
    placeholder="Enter your review…"
    {...input}/>

const AttachmentsInput = uploadFile => input =>
  <Attachments
    uploadFile={uploadFile}
    {...input}/>

const ConfidentialInput = input =>
  <NoteEditor
    title="Confidential"
    placeholder="Enter a confidential note to the editor (optional)…"
    {...input}/>

const RecommendationInput = journal => input =>
  <RadioGroup
    inline
    class={classes.class}
    options={journal.recommendations}
    {...input}/>

const ReviewForm = ({ journal, valid, handleSubmit, uploadFile }) => (
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
            component={AttachmentsInput(uploadFile)}/>
        </div>
      </FormSection>
    </div>

    <div className={classes.section}>
      <FormSection name="confidential">
        <div className={classes.note}>
          <div className={classes.content}>
            <ValidatedField
              name="content"
              component={ConfidentialInput}/>
          </div>

          <ValidatedField
            name="attachments"
            component={AttachmentsInput}/>
        </div>
      </FormSection>
    </div>

    <div className={classes.section}>
      <FormSection name="Recommendation">
        <div className={classes.title}>Recommendation</div>  
        <ValidatedField
          name="recommendation"
          validate={[required]}
          component={RecommendationInput(journal)}/>
      </FormSection>
    </div>

    <div>
      <Button type="submit" primary disabled={!valid}>Submit</Button>
    </div>
  </form>
)

export default withJournal(ReviewForm)
