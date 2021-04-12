import React from 'react'
import PropTypes from 'prop-types'
import { Formik } from 'formik'
import { set } from 'lodash'
import DecisionAndReviews from './DecisionAndReviews'
import CreateANewVersion from './CreateANewVersion'
import FormTemplate from './FormTemplate'
import ReviewMetadata from '../../../component-review/src/components/metadata/ReviewMetadata'
import MessageContainer from '../../../component-chat/src'
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

const SubmittedVersion = ({
  manuscript,
  currentVersion,
  createNewVersion,
  form,
}) => {
  const reviseDecision = currentVersion && manuscript.status === 'revise'
  return (
    <>
      {reviseDecision && (
        <CreateANewVersion
          createNewVersion={createNewVersion}
          currentVersion={currentVersion}
          manuscript={manuscript}
        />
      )}
      <DecisionAndReviews manuscript={manuscript} noGap={!reviseDecision} />
      <ReviewMetadata form={form} manuscript={manuscript} />
    </>
  )
}

SubmittedVersion.propTypes = {
  manuscript: PropTypes.objectOf(PropTypes.any),
  currentVersion: PropTypes.bool.isRequired,
  createNewVersion: PropTypes.func.isRequired,
  form: PropTypes.shape({
    children: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        component: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        shortDescription: PropTypes.string,
      }).isRequired,
    ).isRequired,
  }).isRequired,
}
SubmittedVersion.defaultProps = {
  manuscript: undefined,
}

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
  toggleConfirming,
  confirming,
  parent,
  onChange,
  onSubmit,
  match,
}) => {
  const decisionSections = []

  const currentVersion = versions[0]

  const addEditor = (manuscript, label) => ({
    content: <EditorSection manuscript={manuscript} />,
    key: `editor_${manuscript.id}`,
    label,
  })

  const submissionValues = createBlankSubmissionBasedOnForm(form)

  versions.forEach((version, index) => {
    const { manuscript, label } = version
    const versionId = manuscript.id

    const editorSection = addEditor(manuscript, 'Manuscript text')
    let decisionSection

    if (
      ['new', 'revising', 'submitted', 'evaluated'].includes(manuscript.status)
    ) {
      Object.assign(submissionValues, JSON.parse(manuscript.submission))

      const versionValues = {
        ...manuscript,
        submission: submissionValues,
      }

      decisionSection = {
        content: (
          <SectionContent noGap>
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
            >
              {formProps => (
                <FormTemplate
                  confirming={confirming}
                  onChange={(value, path) => {
                    onChange(value, path, versionId)
                  }}
                  toggleConfirming={toggleConfirming}
                  {...formProps}
                  form={form}
                  manuscript={manuscript}
                  match={match}
                />
              )}
            </Formik>
          </SectionContent>
        ),
        key: versionId,
        label: 'Edit submission info',
      }
    } else {
      decisionSection = {
        content: (
          <SubmittedVersion
            createNewVersion={createNewVersion}
            currentVersion={version === currentVersion}
            form={form}
            manuscript={manuscript}
          />
        ),
        key: versionId,
        label: 'Submitted info',
      }
    }

    decisionSections.push({
      content: (
        <Tabs
          defaultActiveKey={versionId}
          sections={[decisionSection, editorSection]}
        />
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
          <VersionSwitcher versions={decisionSections} />
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
  match: PropTypes.shape({
    url: PropTypes.string.isRequired,
  }).isRequired,
}
Submit.defaultProps = {
  parent: undefined,
}

export default Submit
