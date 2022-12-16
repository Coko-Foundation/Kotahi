import React, { useState } from 'react'
import { v4 as uuid } from 'uuid'
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

const DecisionVersions = ({
  allUsers,
  currentUser,
  decisionForm,
  form,
  handleChange,
  updateManuscript,
  manuscript,
  sendNotifyEmail,
  sendChannelMessageCb,
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
  invitations,
  setExternalEmail,
  externalEmail,
  selectedEmail,
  setSelectedEmail,
  setShouldPublishField,
  isEmailAddressOptedOut,
  dois,
  refetch,
  updateTask,
  updateTasks,
}) => {
  const [initialValue, setInitialValue] = useState(null)

  const versions = gatherManuscriptVersions(manuscript)

  if (!initialValue)
    setInitialValue(
      versions[0].manuscript.reviews.find(r => r.isDecision) || {
        id: uuid(),
        isDecision: true,
        userId: currentUser.id,
      },
    )

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
                createFile={createFile}
                createTeam={createTeam}
                currentDecisionData={initialValue}
                currentUser={currentUser}
                decisionForm={decisionForm}
                deleteFile={deleteFile}
                displayShortIdAsIdentifier={displayShortIdAsIdentifier}
                dois={dois}
                externalEmail={externalEmail}
                form={form}
                invitations={invitations}
                isCurrentVersion={index === 0}
                isEmailAddressOptedOut={isEmailAddressOptedOut}
                key={version.manuscript.id}
                makeDecision={makeDecision}
                onChange={handleChange}
                parent={manuscript}
                publishManuscript={publishManuscript}
                refetch={refetch}
                reviewers={reviewers}
                reviewForm={reviewForm}
                selectedEmail={selectedEmail}
                sendChannelMessageCb={sendChannelMessageCb}
                sendNotifyEmail={sendNotifyEmail}
                setExternalEmail={setExternalEmail}
                setSelectedEmail={setSelectedEmail}
                setShouldPublishField={setShouldPublishField}
                teamLabels={teamLabels}
                threadedDiscussionProps={threadedDiscussionProps}
                updateManuscript={updateManuscript}
                updateReview={updateReview}
                updateReviewJsonData={(value, path) =>
                  updateReviewJsonData(
                    initialValue.id,
                    value,
                    path,
                    version.manuscript.id,
                  )
                }
                updateTask={index === 0 ? updateTask : null}
                updateTasks={index === 0 ? updateTasks : null}
                updateTeam={updateTeam}
                urlFrag={urlFrag}
                validateDoi={validateDoi}
                validateSuffix={validateSuffix}
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
