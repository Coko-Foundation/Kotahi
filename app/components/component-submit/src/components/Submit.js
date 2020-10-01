import React from 'react'
import { Formik } from 'formik'
import { set } from 'lodash'
import CurrentVersion from './CurrentVersion'
import DecisionAndReviews from './DecisionAndReviews'
import CreateANewVersion from './CreateANewVersion'
import FormTemplate from './FormTemplate'
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

const SubmittedVersion = ({ manuscript, currentVersion, createNewVersion }) => {
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
      <CurrentVersion manuscript={manuscript} />
    </>
  )
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
}) => {
  const decisionSections = []

  const currentVersion = versions[0]

  const addEditor = (manuscript, label) => ({
    content: <EditorSection manuscript={manuscript} />,
    key: `editor_${manuscript.id}`,
    label,
  })

  // Set the initial values based on the form
  const initialValues = {}
  const fieldNames = form.children.map(field => field.name)
  fieldNames.forEach(fieldName => set(initialValues, fieldName, ''))

  versions.forEach((version, index) => {
    const { manuscript, label } = version
    const versionId = manuscript.id

    const editorSection = addEditor(manuscript, 'Manuscript text')
    let decisionSection

    if (['new', 'revising'].includes(manuscript.status)) {
      const versionValues = Object.assign({}, manuscript, {
        submission: Object.assign(
          initialValues.submission,
          JSON.parse(manuscript.submission),
        ),
      })
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
                  ? onSubmit(versionId, values)
                  : setSubmitting(false)
              }}
            >
              {formProps => (
                <FormTemplate
                  confirming={confirming}
                  onChange={onChange(versionId)}
                  toggleConfirming={toggleConfirming}
                  {...formProps}
                  form={form}
                  manuscript={manuscript}
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

export default Submit
