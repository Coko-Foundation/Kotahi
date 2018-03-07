import React from 'react'
import styled from 'styled-components'

import { FormSection } from 'redux-form'
import { NoteEditor } from 'xpub-edit'
import { Attachments, Button, RadioGroup, ValidatedField } from '@pubsweet/ui'

import { withJournal } from 'xpub-journal'
import { required } from 'xpub-validators'

import AdminSection from '../atoms/AdminSection'

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
  <RadioGroup inline options={journal.recommendations} {...input} />
)

const Title = styled.div``

const ReviewForm = ({ journal, valid, handleSubmit, uploadFile }) => (
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
      <FormSection name="confidential">
        <ValidatedField component={ConfidentialInput} name="content" />

        <ValidatedField
          component={AttachmentsInput(uploadFile)}
          name="attachments"
        />
      </FormSection>
    </AdminSection>

    <AdminSection>
      <FormSection name="Recommendation">
        <Title>Recommendation</Title>
        <ValidatedField
          component={RecommendationInput(journal)}
          name="recommendation"
          validate={[required]}
        />
      </FormSection>
    </AdminSection>

    <AdminSection>
      <Button disabled={!valid} primary type="submit">
        Submit
      </Button>
    </AdminSection>
  </form>
)

export default withJournal(ReviewForm)
