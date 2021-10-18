import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
// import { cloneDeep, omit } from 'lodash'
import { Field, ErrorMessage } from 'formik'
import {
  Button,
  // Flexbox,
  RadioGroup as UnstableRadioGroup,
  // UploadButton,
  // UploadingFile,
} from '@pubsweet/ui'
import { JournalContext } from '../../../../xpub-journal/src'
import { required } from '../../../../xpub-validators/src'
import { FilesUpload, SectionContent } from '../../../../shared'
import SimpleWaxEditor from '../../../../wax-collab/src/SimpleWaxEditor'
import { reviewWithComment } from '../review/util'

import {
  Title,
  SectionHeader,
  SectionRowGrid,
  SectionRow,
  SectionAction,
  FormStatus,
  ErrorText,
  ErrorWrap,
  RecommendationInputContainer,
} from '../style'

// This solves issue #38, which caused the entire page to blank in chrome upon selection change, due to strange styling of radio buttons.
const RadioGroup = styled(UnstableRadioGroup)`
  position: relative;
`

const NoteDecision = ({ manuscriptId, updateReview }) => (
  <>
    <Field name="decisionComment">
      {formikBag => (
        <>
          <NoteInput updateReview={updateReview} {...formikBag} />
          <FilesUpload
            fieldName="decisionComment.files"
            fileType="decision"
            initializeReviewComment={async () => {
              const review = reviewWithComment({
                commentType: 'decision',
                isDecision: true,
                values: formikBag.form.values,
                name: 'decisionComment',
              })

              const { data } = await updateReview(review)
              return data.updateReview.decisionComment.id
            }}
            manuscriptId={manuscriptId}
            reviewCommentId={formikBag.field.value?.id}
          />
        </>
      )}
    </Field>
  </>
)

NoteDecision.propTypes = {
  manuscriptId: PropTypes.string.isRequired,
  updateReview: PropTypes.func.isRequired,
}

const NoteInput = ({
  field,
  form: { errors, setFieldValue, setFieldTouched },
  updateReview,
}) => (
  // const review = useState()

  // const review = useRef({})

  // useEffect(() => {
  //   review.current = reviewWithComment({
  //     id: values.decisionComment?.id,
  //     values,
  //     commentType: 'decision',
  //     name: 'decisionComment',
  //     isDecision: true,
  //   })
  // }, [values])

  // console.log('Rendering', review.current)
  <ErrorWrap error={errors.decisionComment}>
    <SimpleWaxEditor
      onChange={value => {
        setFieldValue('decisionComment.content', value)
        updateReview({
          decisionComment: { content: value },
        })
      }}
      placeholder="Write/paste your decision letter here, or upload it using the upload button on the right."
      value={field.value?.content || ''}
    />
    <ErrorText>
      <ErrorMessage name="decisionComment" />
    </ErrorText>
  </ErrorWrap>
)

NoteInput.propTypes = {
  field: PropTypes.shape({
    value: PropTypes.shape({
      content: PropTypes.string,
    }),
  }).isRequired,
  form: PropTypes.shape({
    errors: PropTypes.shape({
      decisionComment: PropTypes.string,
    }).isRequired,
    setFieldValue: PropTypes.func.isRequired,
    setFieldTouched: PropTypes.func.isRequired,
  }).isRequired,
  updateReview: PropTypes.func.isRequired,
}

const RecommendationInput = ({
  field,
  form: { setFieldValue },
  updateReview,
}) => {
  const journal = useContext(JournalContext)
  return (
    <RecommendationInputContainer>
      <RadioGroup
        {...field}
        inline
        onChange={val => {
          setFieldValue('recommendation', val)
          updateReview({ recommendation: val })
        }}
        options={journal.recommendations}
        value={field.value === '' ? null : field.value}
      />
      <ErrorMessage name="recommendation" />
    </RecommendationInputContainer>
  )
}

RecommendationInput.propTypes = {
  field: PropTypes.shape({ value: PropTypes.string }).isRequired,
  form: PropTypes.shape({ setFieldValue: PropTypes.func.isRequired })
    .isRequired,
  updateReview: PropTypes.func.isRequired,
}

const DecisionForm = ({
  manuscriptId,
  handleSubmit,
  updateReview,
  isValid,
  isSubmitting,
  submitCount,
  dirty,
}) => {
  let status = null

  if (isSubmitting) {
    status = 'Your decision is submitting...'
  } else if (submitCount) {
    status = 'Your decision has been saved.'
  }

  return (
    <SectionContent>
      <form onSubmit={handleSubmit}>
        <SectionHeader>
          <Title>Decision</Title>
        </SectionHeader>
        <SectionRow>
          <NoteDecision
            manuscriptId={manuscriptId}
            updateReview={updateReview}
          />
        </SectionRow>
        <SectionRowGrid>
          <Field
            component={RecommendationInput}
            name="recommendation"
            updateReview={updateReview}
            validate={required}
          />
          <FormStatus>{status}</FormStatus>
          <SectionAction>
            <Button
              disabled={!isValid || isSubmitting} // We don't check for dirty because the initialValue may not match the manuscript's status, and the user may want to submit it like that.
              primary
              type="submit"
            >
              Submit
            </Button>
          </SectionAction>
        </SectionRowGrid>
      </form>
    </SectionContent>
  )
}

DecisionForm.propTypes = {
  manuscriptId: PropTypes.string.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  updateReview: PropTypes.func.isRequired,
  isValid: PropTypes.bool.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  submitCount: PropTypes.number.isRequired,
  dirty: PropTypes.bool.isRequired,
}

export default DecisionForm
