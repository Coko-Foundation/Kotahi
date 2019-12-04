import React, { useContext } from 'react'
import styled from 'styled-components'
import { cloneDeep, set } from 'lodash'
import { Field } from 'formik'
import { NoteEditor } from 'xpub-edit'
import {
  Button,
  Flexbox,
  RadioGroup,
  UploadButton,
  UploadingFile,
} from '@pubsweet/ui'

import { JournalContext } from 'xpub-journal'
import { getCommentFiles, stripHtml, createComments } from './util'
import AdminSection from '../atoms/AdminSection'

const AttachmentsInput = ({
  field,
  form: { values },
  updateReview,
  uploadFile,
  type,
}) => (
  <>
    <UploadButton
      buttonText="↑ Upload files"
      onChange={event => {
        const val = event.target.files[0]
        const file = cloneDeep(val)
        file.filename = val.name
        file.type = type

        const { updateIndex, comment } = createComments(
          values,
          { files: [file] },
          type,
        )

        const data = cloneDeep(values)
        set(data, `comments.${updateIndex}`, comment)

        updateReview(data).then(({ data: { updateReview } }) => {
          uploadFile(val, updateReview, type)
        })
      }}
    />
    <Flexbox>
      {getCommentFiles(values, type).map(val => {
        const file = cloneDeep(val)
        file.name = file.filename
        return <UploadingFile file={file} key={file.name} uploaded />
      })}
    </Flexbox>
  </>
)

const NoteInput = ({
  field,
  form: { values, setFieldValue },
  updateReview,
}) => (
  <NoteEditor
    key="note-comment"
    placeholder="Enter your review…"
    title="Comments to the Author"
    {...field}
    onChange={value => {
      const { comment } = createComments(
        values,
        {
          type: 'note',
          content: stripHtml(value),
        },
        'note',
      )

      setFieldValue(`comments.0`, comment)
      const data = cloneDeep(values)
      set(data, `comments.0`, comment)
      updateReview(data)
    }}
    value={field.value || ''}
  />
)

const ConfidentialInput = ({
  field,
  form: { values, setFieldValue },
  updateReview,
}) => (
  <NoteEditor
    key="confidential-comment"
    placeholder="Enter a confidential note to the editor (optional)…"
    title="Confidential Comments to Editor (Optional)"
    {...field}
    onChange={value => {
      const { comment } = createComments(
        values,
        {
          type: 'confidential',
          content: stripHtml(value),
        },
        'confidential',
      )

      setFieldValue(`comments.1`, comment)
      const data = cloneDeep(values)
      set(data, `comments.1`, comment)
      updateReview(data)
    }}
    value={field.value || ''}
  />
)

const RecommendationInput = ({ field, form: { values }, updateReview }) => {
  const journal = useContext(JournalContext)
  return (
    <RadioGroup
      inline
      {...field}
      onChange={val => {
        const data = cloneDeep(values)
        set(data, 'recommendation', val)
        updateReview(data)
      }}
      options={journal.recommendations}
    />
  )
}
const ReviewComment = props => (
  <>
    <AdminSection>
      <div name="note">
        <Field
          component={extraProps => <NoteInput {...props} {...extraProps} />}
          key="noteField"
          name="comments.0.content"
        />
        <Field
          component={extraProps => (
            <AttachmentsInput type="note" {...props} {...extraProps} />
          )}
        />
      </div>
    </AdminSection>
    <AdminSection>
      <div name="confidential">
        <Field
          component={extraProps => (
            <ConfidentialInput {...props} {...extraProps} />
          )}
          key="confidentialField"
          name="comments.1.content"
        />
        <Field
          component={extraProps => (
            <AttachmentsInput type="confidential" {...props} {...extraProps} />
          )}
        />
      </div>
    </AdminSection>
  </>
)

const Title = styled.div``

const ReviewForm = ({
  journal,
  isValid,
  handleSubmit,
  updateReview,
  uploadFile,
  review,
}) => (
  <form onSubmit={handleSubmit}>
    <ReviewComment updateReview={updateReview} uploadFile={uploadFile} />
    <AdminSection>
      <div name="Recommendation">
        <Title>Recommendation</Title>
        <Field
          component={props => (
            <RecommendationInput
              journal={journal}
              updateReview={updateReview}
              {...props}
            />
          )}
          name="recommendation"
          updateReview={updateReview}
        />
      </div>
    </AdminSection>

    <AdminSection>
      <Button disabled={!isValid} primary type="submit">
        Submit
      </Button>
    </AdminSection>
  </form>
)

export default ReviewForm
