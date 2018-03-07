import React from 'react'
import { FormSection } from 'redux-form'
import { TextField, ValidatedField, th } from '@pubsweet/ui'
import { join, split } from 'xpub-validators'
import { Section, Legend } from '../styles'

const joinComma = join(',')
const splitComma = split(',')

const SuggestedReviewerInput = input => (
  <TextField placeholder="Add reviewer names" {...input} />
)

const OpposedReviewerInput = input => (
  <TextField placeholder="Add reviewer names" {...input} />
)

const SuggestedEditorInput = input => (
  <TextField placeholder="Add editor names" {...input} />
)

const OpposedEditorInput = input => (
  <TextField placeholder="Add editor names" {...input} />
)

const SubLegend = Legend.extend`
  font-weight: normal;
  margin-top: ${th('gridUnit')};
`

const Suggestions = ({ readonly }) => (
  <FormSection name="suggestions">
    <Section id="suggestions.reviewers">
      <FormSection name="reviewers">
        <Legend>Suggested or opposed reviewers</Legend>

        <div>
          <SubLegend space>Suggested reviewers</SubLegend>

          <ValidatedField
            component={SuggestedReviewerInput}
            format={joinComma}
            name="suggested"
            parse={splitComma}
            readonly={readonly}
          />
        </div>

        <div>
          <SubLegend space>Opposed reviewers</SubLegend>

          <ValidatedField
            component={OpposedReviewerInput}
            format={joinComma}
            name="opposed"
            parse={splitComma}
            readonly={readonly}
          />
        </div>
      </FormSection>
    </Section>

    <Section id="suggestions.editors">
      <FormSection name="editors">
        <Legend>Suggested or opposed editors</Legend>

        <div>
          <SubLegend space>Suggested editors</SubLegend>

          <ValidatedField
            component={SuggestedEditorInput}
            format={joinComma}
            name="suggested"
            parse={splitComma}
            readonly={readonly}
          />
        </div>

        <div>
          <SubLegend space>Opposed editors</SubLegend>

          <ValidatedField
            component={OpposedEditorInput}
            format={joinComma}
            name="opposed"
            parse={splitComma}
            readonly={readonly}
          />
        </div>
      </FormSection>
    </Section>
  </FormSection>
)

export default Suggestions
