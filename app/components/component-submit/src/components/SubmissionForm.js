import React from 'react'
import { SectionContent } from '../../../shared'
import FormTemplate from './FormTemplate'

const SubmissionForm = ({
  versionValues,
  form,
  onSubmit,
  onChange,
  republish,
  match,
  manuscript,
  createFile,
  deleteFile,
  setShouldPublishField,
  threadedDiscussionProps,
  validateDoi,
}) => {
  return (
    <SectionContent>
      <FormTemplate
        createFile={createFile}
        deleteFile={deleteFile}
        fieldsToPublish={
          manuscript.formFieldsToPublish.find(
            ff => ff.objectId === manuscript.id,
          )?.fieldsToPublish ?? []
        }
        form={form}
        initialValues={versionValues}
        manuscriptId={manuscript.id}
        manuscriptShortId={manuscript.shortId}
        manuscriptStatus={manuscript.status}
        onChange={(value, path) => {
          onChange(value, path, manuscript.id)
        }}
        onSubmit={async (values, { validateForm, setSubmitting, ...other }) => {
          // TODO: Change this to a more Formik idiomatic form
          const isValid = Object.keys(await validateForm()).length === 0
          return isValid
            ? onSubmit(manuscript.id, values) // values are currently ignored!
            : setSubmitting(false)
        }}
        republish={republish}
        setShouldPublishField={async (fieldName, shouldPublish) =>
          setShouldPublishField({
            variables: {
              manuscriptId: manuscript.id,
              objectId: manuscript.id,
              fieldName,
              shouldPublish,
            },
          })
        }
        shouldShowOptionToPublish={!!setShouldPublishField}
        showEditorOnlyFields={false}
        submissionButtonText={
          match.url.includes('/evaluation')
            ? 'Submit Evaluation'
            : 'Submit your research object'
        }
        threadedDiscussionProps={threadedDiscussionProps}
        validateDoi={validateDoi}
      />
    </SectionContent>
  )
}

export default SubmissionForm
