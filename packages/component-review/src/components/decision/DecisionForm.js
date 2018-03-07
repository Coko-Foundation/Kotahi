import React from 'react'

import { FormSection } from 'redux-form'
import { NoteEditor } from 'xpub-edit'
import { Attachments, Button, RadioGroup, ValidatedField } from '@pubsweet/ui'

import { withJournal } from 'xpub-journal'
import { required } from 'xpub-validators'

import AdminSection from '../atoms/AdminSection'

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
    <AdminSection>
      <FormSection name="note">
        <ValidatedField
          component={NoteInput}
          name="content"
          validate={[required]}
        />

        <ValidatedField
          component={AttachmentsInput(uploadFile)}
          name="attachments"
        />
      </FormSection>
    </AdminSection>

    <AdminSection>
      <ValidatedField
        component={RecommendationInput(journal)}
        name="recommendation"
        validate={[required]}
      />
    </AdminSection>

    <AdminSection>
      <Button disabled={!valid} primary type="submit">
        Submit
      </Button>
    </AdminSection>
  </form>
)

export default withJournal(DecisionForm)
