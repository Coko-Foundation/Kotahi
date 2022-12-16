import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { set, debounce } from 'lodash'
import DecisionAndReviews from './DecisionAndReviews'
import CreateANewVersion from './CreateANewVersion'
import ReadonlyFormTemplate from '../../../component-review/src/components/metadata/ReadonlyFormTemplate'
import MessageContainer from '../../../component-chat/src/MessageContainer'

import {
  VersionSwitcher,
  HiddenTabs,
  Columns,
  Chat,
  Manuscript,
  ErrorBoundary,
} from '../../../shared'

// TODO: Improve the import, perhaps a shared component?
import EditorSection from '../../../component-review/src/components/decision/EditorSection'
import AssignEditorsReviewers from './assignEditors/AssignEditorsReviewers'
import AssignEditor from './assignEditors/AssignEditor'
import SubmissionForm from './SubmissionForm'

export const createBlankSubmissionBasedOnForm = form => {
  const allBlankedFields = {}
  const fieldNames = form.children.map(field => field.name)
  fieldNames.forEach(fieldName => set(allBlankedFields, fieldName, ''))
  return allBlankedFields.submission ?? {}
}

const Submit = ({
  versions = [],
  decisionForm,
  reviewForm,
  submissionForm,
  createNewVersion,
  currentUser,
  parent,
  onChange,
  republish,
  onSubmit,
  match,
  updateManuscript,
  createFile,
  deleteFile,
  setShouldPublishField,
  threadedDiscussionProps,
  validateDoi,
  validateSuffix,
}) => {
  const decisionSections = []

  const submissionValues = createBlankSubmissionBasedOnForm(submissionForm)

  const handleSave = (source, versionId) =>
    updateManuscript(versionId, { meta: { source } })

  const handleSaveDebouncer = useMemo(() => debounce(handleSave, 2000))

  versions.forEach(({ manuscript: version, label }, index) => {
    const userCanEditManuscriptAndFormData =
      index === 0 &&
      (['new', 'revising'].includes(version.status) ||
        (currentUser.admin && version.status !== 'rejected'))

    const hasDecision = !['new', 'submitted', 'revising'].includes(
      version.status,
    )

    const editorSection = {
      content: (
        <EditorSection
          currentUser={currentUser}
          manuscript={version}
          readonly={!userCanEditManuscriptAndFormData}
          saveSource={source => {
            handleSaveDebouncer(source, version.id)
          }}
        />
      ),
      key: `editor_${version.id}`,
      label: 'Manuscript text',
    }

    let decisionSection

    if (userCanEditManuscriptAndFormData) {
      Object.assign(submissionValues, JSON.parse(version.submission))

      const versionValues = {
        ...version,
        submission: submissionValues,
      }

      const submissionProps = {
        versionValues,
        form: submissionForm,
        onSubmit,
        onChange,
        republish,
        match,
        manuscript: version,
        createFile,
        deleteFile,
        setShouldPublishField,
        threadedDiscussionProps,
        validateDoi,
        validateSuffix,
      }

      decisionSection = {
        content: <SubmissionForm {...submissionProps} />,
        key: version.id,
        label: 'Edit submission info',
      }
    } else {
      decisionSection = {
        content: (
          <>
            {hasDecision && (
              <DecisionAndReviews
                decisionForm={decisionForm}
                manuscript={version}
                reviewForm={reviewForm}
                threadedDiscussionProps={threadedDiscussionProps}
              />
            )}
            <ReadonlyFormTemplate
              form={submissionForm}
              formData={{
                ...version,
                submission: JSON.parse(version.submission),
              }}
              manuscript={version}
              showEditorOnlyFields={false}
              threadedDiscussionProps={threadedDiscussionProps}
              title="Metadata"
            />
          </>
        ),
        key: version.id,
        label: 'Submitted info',
      }
    }

    decisionSections.push({
      content: (
        <>
          {['ncrc'].includes(process.env.INSTANCE_NAME) && (
            <AssignEditorsReviewers
              AssignEditor={AssignEditor}
              manuscript={version}
            />
          )}
          {index === 0 && version.status === 'revise' && (
            <CreateANewVersion
              createNewVersion={createNewVersion}
              manuscript={version}
            />
          )}
          <HiddenTabs
            defaultActiveKey={version.id}
            sections={[decisionSection, editorSection]}
          />
        </>
      ),
      key: version.id,
      label,
    })
  })

  // Protect if channels don't exist for whatever reason
  let channelId

  if (Array.isArray(parent.channels) && parent.channels.length) {
    channelId = parent.channels.find(c => c.type === 'all').id
  }

  React.useEffect(() => {
    handleSaveDebouncer.flush()
  }, [versions.length])

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

const formPropTypes = PropTypes.shape({
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
})

Submit.propTypes = {
  versions: PropTypes.arrayOf(
    PropTypes.shape({
      // eslint-disable-next-line react/forbid-prop-types
      manuscript: PropTypes.objectOf(PropTypes.any),
      label: PropTypes.string,
    }),
  ).isRequired,
  submissionForm: formPropTypes.isRequired,
  decisionForm: formPropTypes.isRequired,
  reviewForm: formPropTypes.isRequired,
  createNewVersion: PropTypes.func.isRequired,
  currentUser: PropTypes.shape({
    admin: PropTypes.bool,
  }),
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
