import React, { useContext } from 'react'
import { NoteEditor } from 'xpub-edit'
// import { cloneDeep, omit } from 'lodash'
import { Field } from 'formik'
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
} from '../style'

const NoteDecision = ({ updateReview }) => (
  <>
    <Field key="noteField" name="decisionComment">
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
    {/* <Field
      component={NoteInput}
      key="commentinput"
      name="comments"
      updateReview={updateReview}
      validate={required}
    />
    <FilesUpload
      objectType="Review"
      objectId=
      key="attachmentinput"
      fileType="note"
      updateReview={updateReview}
    /> */}
  </>
)

const NoteInput = ({
  field,
  form: { values, setFieldValue },
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
  <>
    <NoteEditor
      data-testid="decisionComment"
      key="note-input"
      onBlur={() => {}}
      onChange={value => {
        // review.current.decisionComment.content = value
        updateReview({
          decisionComment: { content: value },
        })
      }}
      placeholder="Write/paste your decision letter here, or upload it using the upload button on the right."
      value={field.value?.content || ''}
    />
  </>
)

const RecommendationInput = ({
  field,
  form: { setFieldValue },
  updateReview,
}) => {
  const journal = useContext(JournalContext)
  return (
    <RadioGroup
      {...field}
      inline
      onChange={val => {
        setFieldValue(`recommendation`, val)
        updateReview({ recommendation: val })
      }}
      options={journal.recommendations}
      value={field.value === '' ? null : field.value}
    />
  )
}

const DecisionForm = ({
  handleSubmit,
  updateReview,
  isValid,
  isSubmitting,
  submitCount,
}) => {
  let status = null
  if (isSubmitting) {
    status = 'Your decision is submitting...'
  } else if (submitCount) {
    status = 'Your decision has been saved.'
  }

  return (
    <Container key="decisionform">
      <form onSubmit={handleSubmit}>
        <SectionHeader>
          <Title>Decision</Title>
        </SectionHeader>
        <SectionRow key="note">
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
          <SectionAction key="submit">
            <Button disabled={!isValid || isSubmitting} primary type="submit">
              Submit
            </Button>
          </SectionAction>
        </SectionRowGrid>
      </form>
    </Container>
  )
}

export default DecisionForm
