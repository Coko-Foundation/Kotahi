import React, { useContext } from 'react'
import { Field } from 'formik'
import { NoteEditor } from 'xpub-edit'
import { Button, RadioGroup } from '@pubsweet/ui'

import { JournalContext } from '../../../../xpub-journal/src'
import { reviewWithComment } from './util'
import {
  AdminSection,
  Title,
  SectionHeader,
  SectionRowGrid,
  SectionRow,
  SectionAction,
  RecommendationInputContainer,
} from '../style'

import { SectionContent, FilesUpload } from '../../../../shared'

const NoteInput = ({
  field,
  form: { values, setFieldValue, setTouched },
  updateReview,
  ...rest
}) => (
  <NoteEditor
    data-testid="reviewComment"
    key="note-comment"
    placeholder="Enter your review…"
    title="Comments to the Author"
    {...field}
    onBlur={value => {
      // const review = reviewWithComment({
      //   id: values.reviewComment?.id,
      //   value,
      //   values,
      //   commentType: 'review',
      //   name: 'reviewComment',
      // })
      updateReview({ reviewComment: { content: value } })
    }}
    value={field.value?.content || ''}
  />
)

const ConfidentialInput = ({
  field,
  form: { values, setFieldValue },
  updateReview,
}) => (
  <NoteEditor
    data-testid="confidentialComment"
    key="confidential-comment"
    placeholder="Enter a confidential note to the editor (optional)…"
    title="Confidential Comments to Editor (Optional)"
    {...field}
    onBlur={value => {
      // const review = reviewWithComment({
      //   id: values.confidentialComment?.id,
      //   value,
      //   values,
      //   commentType: 'confidential',
      //   name: 'confidentialComment',
      // })
      updateReview({ confidentialComment: { content: value } })
    }}
    value={field.value?.content || ''}
  />
)

const RecommendationInput = ({ field, form: { values }, updateReview }) => {
  const journal = useContext(JournalContext)
  return (
    <RecommendationInputContainer>
      <RadioGroup
        inline
        {...field}
        data-testid="recommendation"
        onChange={val => {
          updateReview({ recommendation: val })
        }}
        options={journal.recommendations}
      />
    </RecommendationInputContainer>
  )
}
const ReviewComment = ({ updateReview }) => (
  <>
    <AdminSection>
      <div name="note">
        <Field key="noteField" name="reviewComment">
          {formikBag => (
            <>
              <NoteInput updateReview={updateReview} {...formikBag} />
              <FilesUpload
                containerId={formikBag.field.value?.id}
                containerName="reviewComment"
                fieldName="reviewComment.files"
                initializeContainer={async () => {
                  // If the container for the uploaded files is not present,
                  // we have to create it. InitializeContainer will be called
                  // if containerId is undefined
                  const review = reviewWithComment({
                    commentType: 'review',
                    values: formikBag.form.values,
                    name: 'reviewComment',
                  })
                  // This is an upsert
                  const { data } = await updateReview(review)
                  // And we the return the file container id, so
                  // that we have somewhere to attach uploaded files
                  return data.updateReview.reviewComment.id
                }}
              />
            </>
          )}
        </Field>
      </div>
    </AdminSection>
    <AdminSection>
      <div name="confidential">
        <Field key="confidentialField" name="confidentialComment">
          {formikBag => (
            <>
              <ConfidentialInput updateReview={updateReview} {...formikBag} />
              <FilesUpload
                containerId={formikBag.field.value?.id}
                containerName="reviewComment"
                fieldName="confidentialComment.files"
                initializeContainer={async () => {
                  // If the container for the uploaded files is not present,
                  // we have to create it. InitializeContainer will be called
                  // if containerId is undefined
                  const review = reviewWithComment({
                    commentType: 'confidential',
                    values: formikBag.form.values,
                    name: 'confidentialComment',
                  })
                  // This is an upsert
                  const { data } = await updateReview(review)
                  // And we the return the file container id, so
                  // that we have somewhere to attach uploaded files
                  return data.updateReview.confidentialComment.id
                }}
              />
            </>
          )}
        </Field>
      </div>
    </AdminSection>
  </>
)

const ReviewForm = ({
  journal,
  isValid,
  isSubmitting,
  handleSubmit,
  updateReview,
  uploadFile,
  review,
}) => (
  <SectionContent>
    <form onSubmit={handleSubmit}>
      <AdminSection>
        <SectionHeader>
          <Title>Review</Title>
        </SectionHeader>
        <SectionRow key="note">
          <ReviewComment review={review} updateReview={updateReview} />
        </SectionRow>
        <SectionHeader>
          <Title>Recommendation</Title>
        </SectionHeader>
        <SectionRowGrid>
          <Field name="recommendation" updateReview={updateReview}>
            {props => (
              <RecommendationInput
                journal={journal}
                updateReview={updateReview}
                {...props}
              />
            )}
          </Field>
          <SectionAction key="submit">
            <Button disabled={!isValid || isSubmitting} primary type="submit">
              Submit
            </Button>
          </SectionAction>
        </SectionRowGrid>
      </AdminSection>
    </form>
  </SectionContent>
)

export default ReviewForm
