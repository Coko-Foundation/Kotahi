import React, { useContext } from 'react'
import { NoteEditor } from 'xpub-edit'
// import { cloneDeep, omit } from 'lodash'
import { Field, ErrorMessage } from 'formik'
import {
  Button,
  // Flexbox,
  RadioGroup,
  // UploadButton,
  // UploadingFile,
} from '@pubsweet/ui'
import { JournalContext } from '../../../../xpub-journal/src'
import { required } from '../../../../xpub-validators/src'
import { FilesUpload } from '../../../../shared'

import { reviewWithComment } from '../review/util'

import {
  Container,
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

const RecommendationInput = ({
  field,
  form: { setFieldValue, errors },
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
    <Container>
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
    </Container>
  )
}

export default DecisionForm
