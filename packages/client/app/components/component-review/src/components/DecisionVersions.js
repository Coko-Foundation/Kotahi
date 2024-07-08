import React, { useMemo } from 'react'
import { v4 as uuid } from 'uuid'
import { useTranslation } from 'react-i18next'
import DecisionVersion from './DecisionVersion'
import gatherManuscriptVersions from '../../../../shared/manuscript_versions'

import {
  VersionSwitcher,
  ErrorBoundary,
  Columns,
  Manuscript,
  Chat,
} from '../../../shared'
import MessageContainer from '../../../component-chat/src/MessageContainer'
import { ChatButton, CollapseButton } from './style'

const DecisionVersions = ({
  allUsers,
  addReviewer,
  assignAuthorForProofing,
  roles,
  currentUser,
  createYjsProvider,
  decisionForm,
  chatProps,
  channels,
  form,
  handleChange,
  updateManuscript,
  manuscript,
  sendNotifyEmail,
  sendChannelMessage,
  makeDecision,
  updateReviewJsonData,
  publishManuscript,
  updateTeam,
  createTeam,
  updateReview,
  reviewForm,
  reviewers,
  teamLabels,
  canHideReviews,
  urlFrag,
  displayShortIdAsIdentifier,
  deleteFile,
  createFile,
  threadedDiscussionProps,
  validateDoi,
  validateSuffix,
  setExternalEmail,
  externalEmail,
  selectedEmail,
  setSelectedEmail,
  setShouldPublishField,
  selectedEmailIsBlacklisted,
  updateSharedStatusForInvitedReviewer,
  lockUnlockReview,
  dois,
  refetch,
  updateTask,
  updateTasks,
  teams,
  updateTeamMember,
  updateCollaborativeTeamMember,
  removeReviewer,
  updateTaskNotification,
  deleteTaskNotification,
  createTaskEmailNotificationLog,
  emailTemplates,
}) => {
  const { t } = useTranslation()
  const versions = gatherManuscriptVersions(manuscript)
  const firstVersion = versions[versions.length - 1]

  const initialValue = useMemo(
    () =>
      versions[0].manuscript.reviews.find(r => r.isDecision) || {
        id: uuid(),
        isDecision: true,
        userId: currentUser.id,
      },
    [],
  )

  const [isDiscussionVisible, setIsDiscussionVisible] = React.useState(
    currentUser.chatExpanded,
  )

  const toggleDiscussionVisibility = async () => {
    try {
      const { channelsData, reloadUnreadMessageCounts } = chatProps || {}

      const dataRefetchPromises = channelsData?.map(async channel => {
        await channel?.refetchUnreadMessagesCount?.()
        await channel?.refetchNotificationOptionData?.()
      })

      if (reloadUnreadMessageCounts) {
        dataRefetchPromises.push(reloadUnreadMessageCounts())
      }

      await Promise.all(dataRefetchPromises)

      setIsDiscussionVisible(prevState => !prevState)
    } catch (error) {
      console.error('Error toggling discussion visibility:', error)
    }
  }

  const manuscriptLatestVersionId = versions[0].manuscript.id

  return (
    <Columns>
      <Manuscript>
        <ErrorBoundary>
          <VersionSwitcher>
            {versions.map((version, index) => (
              <DecisionVersion
                addReviewer={addReviewer}
                allUsers={allUsers}
                assignAuthorForProofing={assignAuthorForProofing}
                canHideReviews={canHideReviews}
                createFile={createFile}
                createTaskEmailNotificationLog={createTaskEmailNotificationLog}
                createTeam={createTeam}
                createYjsProvider={createYjsProvider}
                currentDecisionData={initialValue}
                currentUser={currentUser}
                decisionForm={decisionForm}
                deleteFile={deleteFile}
                deleteTaskNotification={deleteTaskNotification}
                displayShortIdAsIdentifier={displayShortIdAsIdentifier}
                dois={dois}
                emailTemplates={emailTemplates}
                externalEmail={externalEmail}
                form={form}
                invitations={version.manuscript.invitations || []}
                isCurrentVersion={index === 0}
                key={version.manuscript.id}
                lockUnlockReview={lockUnlockReview}
                makeDecision={makeDecision}
                manuscriptLatestVersionId={manuscriptLatestVersionId}
                onChange={handleChange}
                parent={firstVersion.manuscript}
                publishManuscript={publishManuscript}
                refetch={refetch}
                removeReviewer={removeReviewer}
                reviewers={reviewers}
                reviewForm={reviewForm}
                roles={roles}
                selectedEmail={selectedEmail}
                selectedEmailIsBlacklisted={selectedEmailIsBlacklisted}
                sendChannelMessage={sendChannelMessage}
                sendNotifyEmail={sendNotifyEmail}
                setExternalEmail={setExternalEmail}
                setSelectedEmail={setSelectedEmail}
                setShouldPublishField={setShouldPublishField}
                teamLabels={teamLabels}
                teams={teams}
                threadedDiscussionProps={threadedDiscussionProps}
                updateCollaborativeTeamMember={updateCollaborativeTeamMember}
                updateManuscript={updateManuscript}
                updateReview={updateReview}
                updateReviewJsonData={updateReviewJsonData}
                updateSharedStatusForInvitedReviewer={
                  updateSharedStatusForInvitedReviewer
                }
                updateTask={updateTask}
                updateTaskNotification={updateTaskNotification}
                updateTasks={updateTasks}
                updateTeam={updateTeam}
                updateTeamMember={updateTeamMember}
                urlFrag={urlFrag}
                validateDoi={validateDoi}
                validateSuffix={validateSuffix}
                version={version.manuscript}
                versionNumber={versions.length - index}
              />
            ))}
          </VersionSwitcher>
        </ErrorBoundary>
      </Manuscript>
      {isDiscussionVisible && (
        <Chat>
          <MessageContainer
            channels={channels}
            chatProps={chatProps}
            currentUser={currentUser}
            manuscriptId={manuscript.id}
          />
          <CollapseButton
            iconName="ChevronRight"
            onClick={toggleDiscussionVisibility}
            title={t('chat.Hide Chat')}
          />
        </Chat>
      )}
      {!isDiscussionVisible && (
        <ChatButton
          iconName="MessageSquare"
          onClick={toggleDiscussionVisibility}
          title={t('chat.Show Chat')}
          unreadMessagesCount={
            chatProps.unreadMessagesQueryResult?.data?.unreadMessagesCount
          }
        />
      )}
    </Columns>
  )
}

export default DecisionVersions
