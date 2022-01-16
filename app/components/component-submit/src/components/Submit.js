import React from 'react'
import PropTypes from 'prop-types'
import { Formik } from 'formik'
import { set } from 'lodash'
import DecisionAndReviews from './DecisionAndReviews'
import CreateANewVersion from './CreateANewVersion'
import FormTemplate from './FormTemplate'
import ReviewMetadata from '../../../component-review/src/components/metadata/ReviewMetadata'
import MessageContainer from '../../../component-chat/src/MessageContainer'

import {
  SectionContent,
  VersionSwitcher,
  Tabs,
  Columns,
  Chat,
  Manuscript,
  ErrorBoundary,
} from '../../../shared'

// TODO: Improve the import, perhaps a shared component?
import EditorSection from '../../../component-review/src/components/decision/EditorSection'
import AssignEditorsReviewers from '../../../component-review/src/components/assignEditors/AssignEditorsReviewers'
import AssignEditor from '../../../component-review/src/components/assignEditors/AssignEditor'

const createBlankSubmissionBasedOnForm = form => {
  const allBlankedFields = {}
  const fieldNames = form.children.map(field => field.name)
  fieldNames.forEach(fieldName => set(allBlankedFields, fieldName, ''))
  return allBlankedFields.submission ?? {}
}

const Submit = ({
  versions = [],
  form,
  createNewVersion,
  currentUser,
  toggleConfirming,
  confirming,
  parent,
  onChange,
  republish,
  onSubmit,
  match,
  updateManuscript,
}) => {
  const decisionSections = []

  const currentVersion = versions[0]

  const submissionValues = createBlankSubmissionBasedOnForm(form)

  versions.forEach((version, index) => {
    const { manuscript, label } = version
    const versionId = manuscript.id

    const userCanEditManuscriptAndFormData =
      version === currentVersion &&
      (['new', 'revising'].includes(manuscript.status) ||
        (currentUser.admin && manuscript.status !== 'rejected'))

    const hasDecision = !['new', 'submitted', 'revising'].includes(
      manuscript.status,
    )

    const editorSection = {
      content: (
        <EditorSection
          currentUser={currentUser}
          manuscript={manuscript}
          onBlur={source => updateManuscript(versionId, { meta: { source } })}
          readonly={!userCanEditManuscriptAndFormData}
        />
      ),
      key: `editor_${manuscript.id}`,
      label: 'Manuscript text',
    }

    let decisionSection

    if (userCanEditManuscriptAndFormData) {
      Object.assign(submissionValues, JSON.parse(manuscript.submission))

      const versionValues = {
        ...manuscript,
        submission: submissionValues,
      }

      decisionSection = {
        content: (
          <SectionContent>
            <Formik
              displayName="submit"
              // handleChange={props.handleChange}
              initialValues={versionValues}
              onSubmit={async (
                values,
                { validateForm, setSubmitting, ...other },
              ) => {
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
                    confirming={confirming}
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
        ),
        key: versionId,
        label: 'Edit submission info',
      }
    } else {
      decisionSection = {
        content: (
          <>
            {hasDecision && <DecisionAndReviews manuscript={manuscript} />}
            <ReviewMetadata
              form={form}
              manuscript={manuscript}
              showEditorOnlyFields={false}
            />
          </>
        ),
        key: versionId,
        label: 'Submitted info',
      }
    }

    decisionSections.push({
      content: (
        <>
          {['ncrc'].includes(process.env.INSTANCE_NAME) && (
            <AssignEditorsReviewers
              AssignEditor={AssignEditor}
              manuscript={manuscript}
            />
          )}
          {version === currentVersion && manuscript.status === 'revise' && (
            <CreateANewVersion
              createNewVersion={createNewVersion}
              currentVersion={currentVersion}
              manuscript={manuscript}
            />
          )}
          <Tabs
            defaultActiveKey={versionId}
            sections={[decisionSection, editorSection]}
          />
        </>
      ),
      key: manuscript.id,
      label,
    })
  })

  // Protect if channels don't exist for whatever reason
  let channelId

  if (Array.isArray(parent.channels) && parent.channels.length) {
    channelId = parent.channels.find(c => c.type === 'all').id
  }

  return (
    <Columns>
      <Manuscript>
        <ErrorBoundary>
          <VersionSwitcher
            key={decisionSections.length}
            versions={decisionSections}
          />
        </ErrorBoundary>
      </Manuscript>
      <Chat>
        <MessageContainer channelId={channelId} />
      </Chat>
    </Columns>
  )
}

Submit.propTypes = {
  versions: PropTypes.arrayOf(
    PropTypes.shape({
      manuscript: PropTypes.objectOf(PropTypes.any),
      label: PropTypes.string,
    }),
  ).isRequired,
  form: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    children: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        sectioncss: PropTypes.string,
        id: PropTypes.string.isRequired,
        component: PropTypes.string.isRequired,
        group: PropTypes.string,
        placeholder: PropTypes.string,
        validate: PropTypes.arrayOf(PropTypes.object.isRequired),
        validateValue: PropTypes.objectOf(
          PropTypes.oneOfType([
            PropTypes.string.isRequired,
            PropTypes.number.isRequired,
          ]).isRequired,
        ),
      }).isRequired,
    ).isRequired,
    popuptitle: PropTypes.string,
    popupdescription: PropTypes.string,
    haspopup: PropTypes.string.isRequired, // bool as string
  }).isRequired,
  createNewVersion: PropTypes.func.isRequired,
  currentUser: PropTypes.shape({
    admin: PropTypes.bool.isRequired,
  }),
  toggleConfirming: PropTypes.func.isRequired,
  confirming: PropTypes.bool.isRequired,
  parent: PropTypes.shape({
    channels: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
      }),
    ),
  }),
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  republish: PropTypes.func.isRequired,
  match: PropTypes.shape({
    url: PropTypes.string.isRequired,
  }).isRequired,
  updateManuscript: PropTypes.func.isRequired,
}
Submit.defaultProps = {
  currentUser: { admin: false },
  parent: undefined,
}

export default Submit
