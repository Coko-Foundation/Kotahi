import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { NoteEditor } from 'xpub-edit'
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

// import Wax from '../../../../wax-collab/src/Editoria'

// This solves issue #38, which caused the entire page to blank in chrome upon selection change, due to strange styling of radio buttons.
const RadioGroup = styled(UnstableRadioGroup)`
  position: relative;
`

const NoteDecision = ({ updateReview }) => (
  <>
    <Field name="decisionComment">
      {formikBag => (
        <>
          <NoteInput updateReview={updateReview} {...formikBag} />
          <FilesUpload
            containerId={formikBag.field.value?.id}
            containerName="reviewComment"
            fieldName="decisionComment.files"
            initializeContainer={async () => {
              const review = reviewWithComment({
                commentType: 'decision',
                isDecision: true,
                values: formikBag.form.values,
                name: 'decisionComment',
              })

              const { data } = await updateReview(review)
              return data.updateReview.decisionComment.id
            }}
          />
        </>
      )}
    </Field>
  </>
)

NoteDecision.propTypes = {
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
    {
      // TODO: Use the best text editor there is!
      /* <Wax
      // fileUpload={fileUpload}
      // onChange={source => updateManuscript({ source })}
      content={field.value?.content}
    /> */
    }

    <NoteEditor
      data-testid="decisionComment"
      debounceDelay={300}
      onBlur={() => setFieldTouched('decisionComment')}
      onChange={value => {
        setFieldValue('decisionComment', { content: value })
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
          <NoteDecision updateReview={updateReview} />
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
              disabled={!isValid || isSubmitting || !dirty}
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
  handleSubmit: PropTypes.func.isRequired,
  updateReview: PropTypes.func.isRequired,
  isValid: PropTypes.bool.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  submitCount: PropTypes.number.isRequired,
  dirty: PropTypes.bool.isRequired,
}

export default DecisionForm
