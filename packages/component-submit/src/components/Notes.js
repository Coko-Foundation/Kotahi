import React from 'react'
import { FormSection } from 'redux-form'
import { NoteEditor } from 'xpub-edit'
import { ValidatedField } from '@pubsweet/ui'
import { required } from 'xpub-validators'
import { Section } from '../styles'

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
    title="Special instructions (confidential, to Editors only)"
    {...input}
  />
)

const Notes = ({ readonly }) => (
  <FormSection name="notes">
    <Section id="notes.fundingAcknowledgement">
      <ValidatedField
        component={FundingInput}
        name="fundingAcknowledgement"
        readonly={readonly}
        validate={[required]}
      />
    </Section>

    <Section id="notes.specialInstructions">
      <ValidatedField
        component={InstructionsInput}
        name="specialInstructions"
        readonly={readonly}
      />
    </Section>
  </FormSection>
)

export default Notes
