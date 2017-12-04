import React from 'react'
import { FormSection } from 'redux-form'
import { NoteEditor } from 'xpub-edit'
import { Attachments, Button, RadioGroup, ValidatedField } from 'xpub-ui'
import { withJournal } from 'xpub-journal'
import { required } from 'xpub-validators'
import classes from './DecisionForm.local.scss'

const NoteInput = input => (
  <NoteEditor placeholder="Enter your decision…" title="Decision" {...input} />
)

const AttachmentsInput = uploadFile => input => (
  <Attachments uploadFile={uploadFile} {...input} />
)

const RecommendationInput = journal => input => (
  <RadioGroup inline options={journal.recommendations} required {...input} />
)

const DecisionForm = ({ journal, valid, handleSubmit, uploadFile }) => (
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
      <ValidatedField
        component={RecommendationInput(journal)}
        name="recommendation"
        validate={[required]}
      />
    </div>

    <div>
      <Button disabled={!valid} primary type="submit">
        Submit
      </Button>
    </div>
  </form>
)

export default withJournal(DecisionForm)
