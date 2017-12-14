import React from 'react'
import { FormSection } from 'redux-form'
import { NoteEditor } from 'xpub-edit'
import { Attachments, Button, RadioGroup, ValidatedField } from '@pubsweet/ui'
import { withJournal } from 'xpub-journal'
import { required } from 'xpub-validators'
import classes from './ReviewForm.local.scss'

const NoteInput = input => (
  <NoteEditor placeholder="Enter your review…" title="Review" {...input} />
)

const AttachmentsInput = uploadFile => input => (
  <Attachments uploadFile={uploadFile} {...input} />
)

const ConfidentialInput = input => (
  <NoteEditor
    placeholder="Enter a confidential note to the editor (optional)…"
    title="Confidential"
    {...input}
  />
)

const RecommendationInput = journal => input => (
  <RadioGroup
    class={classes.class}
    inline
    options={journal.recommendations}
    {...input}
  />
)

const ReviewForm = ({ journal, valid, handleSubmit, uploadFile }) => (
  <form onSubmit={handleSubmit}>
    <div className={classes.section}>
      <FormSection name="note">
        <div className={classes.note}>
          <div className={classes.content}>
            <ValidatedField
              component={NoteInput}
              name="content"
              validate={[required]}
            />
          </div>

          <ValidatedField
            component={AttachmentsInput(uploadFile)}
            name="attachments"
          />
        </div>
      </FormSection>
    </div>

    <div className={classes.section}>
      <FormSection name="confidential">
        <div className={classes.note}>
          <div className={classes.content}>
            <ValidatedField component={ConfidentialInput} name="content" />
          </div>

          <ValidatedField
            component={AttachmentsInput(uploadFile)}
            name="attachments"
          />
        </div>
      </FormSection>
    </div>

    <div className={classes.section}>
      <FormSection name="Recommendation">
        <div className={classes.title}>Recommendation</div>
        <ValidatedField
          component={RecommendationInput(journal)}
          name="recommendation"
          validate={[required]}
        />
      </FormSection>
    </div>

    <div>
      <Button disabled={!valid} primary type="submit">
        Submit
      </Button>
    </div>
  </form>
)

export default withJournal(ReviewForm)
