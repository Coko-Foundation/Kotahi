import React from 'react'
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

const DecisionVersions = props => {
  const {
    allUsers,
    confirming,
    currentUser,
    form,
    handleChange,
    toggleConfirming,
    updateManuscript,
    manuscript,
    sendNotifyEmail,
    sendChannelMessageCb,
    makeDecision,
    publishManuscript,
    updateTeam,
    createTeam,
    updateReview,
    reviewers,
    teamLabels,
    canHideReviews,
    urlFrag,
    displayShortIdAsIdentifier,
    deleteFile,
    createFile,
    client,
  } = props

  const versions = gatherManuscriptVersions(manuscript)

  const handleChangeCbk = () => handleChange()

  // Protect if channels don't exist for whatever reason
  let editorialChannelId, allChannelId

  if (Array.isArray(manuscript.channels) && manuscript.channels.length) {
    editorialChannelId = manuscript.channels.find(c => c.type === 'editorial')
      .id
    allChannelId = manuscript.channels.find(c => c.type === 'all').id
  }

  const channels = [
    { id: allChannelId, name: 'Discussion with author' },
    { id: editorialChannelId, name: 'Editorial discussion' },
  ]

  return (
    <Columns>
      <Manuscript>
        <ErrorBoundary>
          <VersionSwitcher>
            {versions.map((version, index) => (
              <DecisionVersion
                allUsers={allUsers}
                canHideReviews={canHideReviews}
                client={client}
                confirming={confirming}
                createFile={createFile}
                createTeam={createTeam}
                current={index === 0}
                currentUser={currentUser}
                deleteFile={deleteFile}
                displayShortIdAsIdentifier={displayShortIdAsIdentifier}
                form={form}
                key={version.manuscript.id}
                makeDecision={makeDecision}
                onChange={handleChangeCbk}
                parent={manuscript}
                publishManuscript={publishManuscript}
                reviewers={reviewers}
                sendChannelMessageCb={sendChannelMessageCb}
                sendNotifyEmail={sendNotifyEmail}
                teamLabels={teamLabels}
                toggleConfirming={toggleConfirming}
                updateManuscript={updateManuscript}
                updateReview={updateReview}
                updateTeam={updateTeam}
                urlFrag={urlFrag}
                version={version.manuscript}
              />
            ))}
          </VersionSwitcher>
        </ErrorBoundary>
      </Manuscript>
      <Chat>
        <MessageContainer channels={channels} manuscriptId={manuscript.id} />
      </Chat>
    </Columns>
  )
}

export default DecisionVersions
