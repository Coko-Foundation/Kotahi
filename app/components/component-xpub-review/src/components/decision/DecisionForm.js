import React, { useContext } from 'react'
import { NoteEditor } from 'xpub-edit'
import { cloneDeep, omit } from 'lodash'
import { FieldArray, Field } from 'formik'
import { JournalContext } from 'xpub-journal'
import { required } from 'xpub-validators'
import {
  Button,
  Flexbox,
  RadioGroup,
  UploadButton,
  UploadingFile,
} from '@pubsweet/ui'

import {
  getCommentFiles,
  getCommentContent,
  stripHtml,
  createComments,
} from '../review/util'

import AdminSection from '../atoms/AdminSection'

const NoteDecision = (updateReview, uploadFile) => props => (
  <AdminSection>
    <Field
      component={NoteInput}
      name="comments"
      updateReview={updateReview}
      validate={required}
    />
    <Field
      component={AttachmentsInput('note')}
      updateReview={updateReview}
      uploadFile={uploadFile}
    />
  </AdminSection>
)

const NoteInput = ({
  field,
  form: { values, setFieldValue },
  updateReview,
}) => (
  <NoteEditor
    key="note-input"
    onBlur={() => {}}
    onChange={value => {
      const { updateIndex, comment } = createComments(
        values,
        {
          type: 'note',
          content: stripHtml(value),
        },
        'note',
      )

      setFieldValue(`comments.${updateIndex}`, comment)
      updateReview(
        cloneDeep(omit({ comment }, ['comment.files', 'comment.__typename'])),
      )
    }}
    placeholder="Write/paste your decision letter here, or upload it using the upload button on the right."
    title="Decision"
    value={getCommentContent({ comments: field.value }, 'note')}
  />
)

const AttachmentsInput = type => ({
  field,
  form: { values, setFieldValue },
  updateReview,
  uploadFile,
}) => (
  <>
    <UploadButton
      buttonText="↑ Upload files"
      key="note-attachment"
      onChange={event => {
        const val = event.target.files[0]
        const file = cloneDeep(val)
        file.filename = val.name
        file.type = type

        const { updateIndex, comment } = createComments(
          field.value,
          { files: [file] },
          type,
        )

        setFieldValue(`comments.${updateIndex}.files`, comment.files)

        updateReview({}).then(({ data: { updateReview } }) => {
          uploadFile(val, updateReview, type)
        })
      }}
    />
    <Flexbox>
      {getCommentFiles(field.value, 'note').map(val => {
        const file = cloneDeep(val)
        file.name = file.filename
        return <UploadingFile file={file} key={file.name} uploaded />
      })}
    </Flexbox>
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

const DecisionForm = ({ handleSubmit, uploadFile, updateReview, isValid }) => (
  <form onSubmit={handleSubmit}>
    <AdminSection key="note">
      <div name="note">
        <FieldArray
          component={NoteDecision(updateReview, uploadFile)}
          key="comments-array"
          name="comments"
        />
      </div>
    </AdminSection>

    <AdminSection key="recommendation">
      <Field
        component={RecommendationInput}
        name="recommendation"
        updateReview={updateReview}
        validate={required}
      />
    </AdminSection>

    <AdminSection key="submit">
      <Button disabled={!isValid} primary type="submit">
        Submit
      </Button>
    </AdminSection>
  </form>
)

export default DecisionForm
