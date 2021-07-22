import React, { useContext } from 'react'
import { Field, ErrorMessage } from 'formik'
import { RadioGroup as UnstableRadioGroup } from '@pubsweet/ui'
import styled from 'styled-components'
import { JournalContext } from '../xpub-journal/src'
import { SectionContent } from '../shared'
import {
  SectionHeader,
  Title,
  SectionRow,
  ErrorWrap,
  ErrorText,
  RecommendationInputContainer,
  SectionRowGrid,
} from '../component-review/src/components/style'
import SimpleWaxEditor from '../wax-collab/src/SimpleWaxEditor'

// import NoteDecision from '../component-review/src/components/decision/DecisionForm'
const RadioGroup = styled(UnstableRadioGroup)`
  position: relative;
`

const NoteDecision = ({ updateReview, content }) => (
  <>
    <Field name="decisionComment">
      {formikBag => (
        <>
          <NoteInput
            content={content}
            updateReview={updateReview}
            {...formikBag}
          />
        </>
      )}
    </Field>
  </>
)

const NoteInput = ({
  form: { errors, setFieldValue, setFieldTouched },
  updateReview,
  content,
}) => (
  <ErrorWrap error={errors.decisionComment}>
    <SimpleWaxEditor readonly value={content || ''} />
    <ErrorText>
      <ErrorMessage name="decisionComment" />
    </ErrorText>
  </ErrorWrap>
)

const RecommendationInput = ({
  field,
  form: { setFieldValue },
  updateReview,
  decision,
}) => {
  const journal = useContext(JournalContext)
  return (
    <RecommendationInputContainer>
      <RadioGroup
        {...field}
        disabled
        inline
        onChange={val => {
          setFieldValue('recommendation', val)
          updateReview({ recommendation: val })
        }}
        options={journal.recommendations}
        value={decision}
      />
      <ErrorMessage name="recommendation" />
    </RecommendationInputContainer>
  )
}

const ArticleEvaluationSummaryPage = ({
  updateReview,
  decisionComment,
  decisionRadio,
}) => (
  <SectionContent>
    <SectionHeader>
      <Title>Evaluation Summary</Title>
    </SectionHeader>
    <SectionRow>
      <NoteDecision content={decisionComment} updateReview={updateReview} />
    </SectionRow>
    <SectionRowGrid>
      <Field
        component={RecommendationInput}
        decision={decisionRadio}
        name="recommendation"
        readonly
      />
    </SectionRowGrid>
  </SectionContent>
)

export default ArticleEvaluationSummaryPage
