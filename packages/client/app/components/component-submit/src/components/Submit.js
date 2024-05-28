import React, { useCallback, useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { set, debounce } from 'lodash'
import { useTranslation } from 'react-i18next'
import { ConfigContext } from '../../../config/src'
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
import {
  ChatButton,
  CollapseButton,
} from '../../../component-review/src/components/style'
import {
  isAuthor,
  isCollaboratorWithWriteAccess,
} from '../../../../shared/userPermissions'
import Modal from '../../../component-modal/src/Modal'
import Confirm from './Confirm'
import InviteCollaborators from './InviteCollaborators'

export const createBlankSubmissionBasedOnForm = form => {
  const allBlankedFields = {}
  const fieldNames = form.children.map(field => field.name)
  fieldNames.forEach(fieldName => set(allBlankedFields, fieldName, ''))
  return allBlankedFields.submission ?? {}
}

const StyledModal = styled(Modal)`
  width: 680px;
`

const Submit = ({
  versions = [],
  decisionForm,
  reviewForm,
  submissionForm,
  createNewVersion,
  currentUser,
  onChange,
  republish,
  onSubmit,
  channelId,
  chatProps,
  parent,
  match,
  channels,
  updateManuscript,
  createFile,
  deleteFile,
  setShouldPublishField,
  threadedDiscussionProps,
  manuscriptLatestVersionId,
  validateDoi,
  validateSuffix,
  chatExpand,
}) => {
  const config = useContext(ConfigContext)

  const channelData = chatProps?.channelsData?.find(
    channel => channel?.channelId === channelId,
  )

  const [isSubmisionDiscussionVisible, setIsSubmisionDiscussionVisible] =
    useState(currentUser.chatExpanded)

  const allowAuthorsSubmitNewVersion =
    config?.submission?.allowAuthorsSubmitNewVersion

  const isLabInstance = ['lab'].includes(config?.instanceName)

  const decisionSections = []

  const submissionValues = createBlankSubmissionBasedOnForm(submissionForm)

  const handleSave = (source, versionId) =>
    updateManuscript(versionId, { meta: { source } })

  const { t } = useTranslation()
  const debouncedSave = useCallback(debounce(handleSave, 2000), [])
  useEffect(() => {
    debouncedSave.flush()
    return () => debouncedSave.flush()
  }, [versions.length])

  versions.forEach(({ manuscript: version, label }, index) => {
    const userCanEditManuscriptAndFormData =
      index === 0 &&
      ((['new', 'revising'].includes(version.status) && !isLabInstance) ||
        (currentUser.groupRoles.includes('groupManager') &&
          version.status !== 'rejected') ||
        (isLabInstance &&
          (isAuthor(version, currentUser) ||
            isCollaboratorWithWriteAccess(version, currentUser))))

    const editorSection = {
      content: (
        <EditorSection
          allowEmptyManuscript={isLabInstance}
          currentUser={currentUser}
          manuscript={version}
          readonly={!userCanEditManuscriptAndFormData}
          saveSource={source => {
            debouncedSave(source, version.id)
          }}
        />
      ),
      key: `editor`,
      label: t(
        `manuscriptSubmit.${isLabInstance ? 'Article' : 'Manuscript text'}`,
      ),
    }

    let decisionSection

    const selectedManuscriptVersionId = version.id

    const threadedDiscussionExtendedProps = {
      ...threadedDiscussionProps,
      manuscriptLatestVersionId,
      selectedManuscriptVersionId,
    }

    if (userCanEditManuscriptAndFormData) {
      Object.assign(submissionValues, version.submission)

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
        threadedDiscussionExtendedProps,
        validateDoi,
        validateSuffix,
      }

      decisionSection = {
        content: <SubmissionForm {...submissionProps} />,
        key: version.id,
        label: t(
          `manuscriptSubmit.${
            isLabInstance ? 'Metadata' : 'Edit submission info'
          }`,
        ),
      }
    } else {
      decisionSection = {
        content: (
          <>
            <DecisionAndReviews
              allowAuthorsSubmitNewVersion={allowAuthorsSubmitNewVersion}
              currentUser={currentUser}
              decisionForm={decisionForm}
              manuscript={version}
              reviewForm={reviewForm}
              threadedDiscussionProps={threadedDiscussionExtendedProps}
            />
            <ReadonlyFormTemplate
              form={submissionForm}
              formData={version}
              manuscript={version}
              showEditorOnlyFields={false}
              threadedDiscussionProps={threadedDiscussionExtendedProps}
              title={t('manuscriptSubmit.Metadata')}
            />
          </>
        ),
        key: version.id,
        label: t('manuscriptSubmit.Submitted info'),
      }
    }

    const tabSections = []

    if (isLabInstance) {
      tabSections.push(editorSection, decisionSection)
    } else {
      tabSections.push(decisionSection, editorSection)
    }

    decisionSections.push({
      content: (
        <>
          {['preprint2'].includes(config.instanceName) && (
            <AssignEditorsReviewers
              AssignEditor={AssignEditor}
              manuscript={version}
            />
          )}
          {index === 0 &&
            !['revising', 'new'].includes(version.status) &&
            (allowAuthorsSubmitNewVersion || version.status === 'revise') && (
              <CreateANewVersion
                allowAuthorsSubmitNewVersion={allowAuthorsSubmitNewVersion}
                createNewVersion={createNewVersion}
                manuscript={version}
              />
            )}
          <HiddenTabs
            defaultActiveKey={isLabInstance ? 'editor' : version.id}
            sections={tabSections}
          />
        </>
      ),
      key: version.id,
      label,
      status: version.status,
      manuscript: version,
    })
  })

  const toggleSubmisionDiscussionVisibility = async () => {
    try {
      await channelData?.refetchUnreadMessagesCount()
      const firstChannel = chatProps?.channelsData?.[0]

      const refetchNotificationOptionData =
        firstChannel?.refetchNotificationOptionData

      if (refetchNotificationOptionData) {
        await refetchNotificationOptionData()
      }

      chatExpand({ variables: { state: !isSubmisionDiscussionVisible } })
      setIsSubmisionDiscussionVisible(prevState => !prevState)
    } catch (error) {
      console.error('Error toggling submission discussion visibility:', error)
    }
  }

  return (
    <Columns>
      <Manuscript>
        <ErrorBoundary>
          <VersionSwitcher
            Confirm={Confirm}
            currentUser={currentUser}
            InviteCollaborators={InviteCollaborators}
            isLabInstance={isLabInstance}
            key={decisionSections.length}
            Modal={StyledModal}
            onSubmit={onSubmit}
            submissionForm={submissionForm}
            versions={decisionSections}
          />
        </ErrorBoundary>
      </Manuscript>
      {isSubmisionDiscussionVisible && (
        <Chat>
          <MessageContainer
            channelId={channelId}
            channels={channels}
            chatProps={chatProps}
            currentUser={currentUser}
          />
          <CollapseButton
            iconName="ChevronRight"
            onClick={toggleSubmisionDiscussionVisibility}
            title={t('chat.Hide Chat')}
          />
        </Chat>
      )}
      {!isSubmisionDiscussionVisible && (
        <ChatButton
          iconName="MessageSquare"
          onClick={toggleSubmisionDiscussionVisibility}
          title={t('chat.Show Chat')}
          unreadMessagesCount={channelData?.unreadMessagesCount}
        />
      )}
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
      readonly: PropTypes.bool,
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
    groupRoles: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
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
  currentUser: { groupRoles: [] },
  parent: undefined,
}

export default Submit
