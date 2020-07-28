import React, { useContext } from 'react'
import { NoteEditor } from 'xpub-edit'
import { cloneDeep, omit } from 'lodash'
import { Field } from 'formik'
import {
  Button,
  Flexbox,
  RadioGroup,
  UploadButton,
  UploadingFile,
} from '@pubsweet/ui'
import { JournalContext } from '../../../../xpub-journal/src'
import { required } from '../../../../xpub-validators/src'

import {
  getCommentFiles,
  getCommentContent,
  stripHtml,
  createComments,
} from '../review/util'

import {
  Container,
  Title,
  SectionHeader,
  SectionRowGrid,
  SectionRow,
  SectionAction,
} from '../style'

const NoteDecision = ({ updateReview, uploadFile }) => (
  <>
    <Field
      component={NoteInput}
      key="commentinput"
      name="comments"
      updateReview={updateReview}
      validate={required}
    />
    <Field
      component={AttachmentsInput('note')}
      key="attachmentinput"
      updateReview={updateReview}
      uploadFile={uploadFile}
    />
  </>
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
  <Container key="decisionform">
    <form onSubmit={handleSubmit}>
      <SectionHeader>
        <Title>Decision</Title>
      </SectionHeader>
      <SectionRow key="note">
        <NoteDecision updateReview={updateReview} uploadFile={uploadFile} />
      </SectionRow>
      <SectionRowGrid>
        <Field
          component={RecommendationInput}
          name="recommendation"
          updateReview={updateReview}
          validate={required}
        />

        <SectionAction key="submit">
          <Button disabled={!isValid} primary type="submit">
            Submit
          </Button>
        </SectionAction>
      </SectionRowGrid>
    </form>
  </Container>
)

export default DecisionForm
