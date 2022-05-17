import React from 'react'
import { Formik } from 'formik'
import { SectionContent } from '../../../shared'
import FormTemplate from './FormTemplate'

const SubmissionForm = ({
  versionValues,
  form,
  onSubmit,
  versionId,
  toggleConfirming,
  confirming,
  onChange,
  republish,
  match,
  client,
  manuscript,
  createFile,
  deleteFile,
}) => {
  return (
    <SectionContent>
      <Formik
        displayName="submit"
        // handleChange={props.handleChange}
        initialValues={versionValues}
        onSubmit={async (values, { validateForm, setSubmitting, ...other }) => {
          // TODO: Change this to a more Formik idiomatic form
          const isValid = Object.keys(await validateForm()).length === 0
          return isValid
            ? onSubmit(versionId, values) // values are currently ignored!
            : setSubmitting(false)
        }}
        validateOnBlur
        validateOnChange={false}
      >
        {formProps => {
          return (
            <FormTemplate
              client={client}
              confirming={confirming}
              createFile={createFile}
              deleteFile={deleteFile}
              onChange={(value, path) => {
                onChange(value, path, versionId)
              }}
              toggleConfirming={toggleConfirming}
              {...formProps}
              form={form}
              manuscript={manuscript}
              republish={republish}
              showEditorOnlyFields={false}
              submissionButtonText={
                match.url.includes('/evaluation')
                  ? 'Submit Evaluation'
                  : 'Submit your research object'
              }
            />
          )
        }}
      </Formik>
    </SectionContent>
  )
}

export default SubmissionForm
