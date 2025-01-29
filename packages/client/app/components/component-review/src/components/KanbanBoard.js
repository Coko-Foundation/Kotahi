/* stylelint-disable alpha-value-notation, color-function-notation */

import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { AdminSection } from './style'
import {
  SectionContent,
  SectionHeader,
  SectionRow,
  Title,
} from '../../../shared'
import ReviewersDeclined from './ReviewersDeclined'
import { getMembersOfTeam } from '../../../../shared/manuscriptUtils'
import statuses from '../../../../../config/journal/review-status'
import localizeReviewFilterOptions from '../../../../shared/localizeReviewFilterOptions'
import KanbanCard from './reviewers/KanbanCard'
import { findReviewFromReviewer } from './reviewers/util'

const Kanban = styled.div`
  align-items: stretch;
  display: flex;
  margin: 15px 7.5px;
  min-height: 300px;
`

const Column = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  margin-inline: 7.5px;
  /* stylelint-disable-next-line scss/operator-no-unspaced */
  width: calc(${100 / (statuses.length - 2)}% - 15px);
`

const StatusLabel = styled.div`
  background-color: ${props => props.statusColor || '#ffffff'};
  border-radius: 12px;
  color: ${props => (props.lightText ? '#ffffff' : '#000000')};
  display: inline-block;
  font-weight: bold;
  margin-block: 4px;
  margin-inline: 0;
  padding: 4px 10px;
`

const CardsWrapper = styled.div`
  background-color: #f8f8f9;
  border-radius: 8px;
  height: 100%;
  margin-top: 8px;
  width: 100%;
`

const ReviewerStatusHeader = styled.div`
  display: flex;
  justify-content: space-between;
`

const VersionNumber = styled.div`
  color: rgba(0, 0, 0, 0.5);
`

// TODO standardise all statuses to camelCase and 'invited' instead
// of 'unanswered' so we don't have to do this!
const normalizeStatus = statusString =>
  statusString
    .toLowerCase()
    .replaceAll('_', '')
    .replace('unanswered', 'invited')

const KanbanBoard = ({
  createFile,
  currentUser,
  deleteFile,
  invitations,
  version,
  versionNumber,
  removeInvitation,
  removeReviewer,
  reviews,
  reviewForm,
  isCurrentVersion,
  manuscript,
  updateSharedStatusForInvitedReviewer,
  updateTeamMember,
  updateCollaborativeTeamMember,
  updateReview,
  updateReviewJsonData,
}) => {
  const reviewers = getMembersOfTeam(version, 'reviewer')

  const collaborativeReviewers = getMembersOfTeam(
    version,
    'collaborativeReviewer',
  ).map(reviewer => ({ ...reviewer, isCollaborative: true }))

  const { t } = useTranslation()

  const emailAndWebReviewers = []

  reviewers.concat(collaborativeReviewers).forEach(reviewer => {
    emailAndWebReviewers.push({
      ...reviewer,
      status: normalizeStatus(reviewer.status),
      isCollaborative: !!reviewer.isCollaborative,
      isEmail: false, // This will be revised to true if we find a matching invitation below
      suggestedReviewers: invitations.find(
        invitation =>
          invitation.invitedPersonType === 'REVIEWER' &&
          invitation.user?.id === reviewer.user.id,
      )?.suggestedReviewers,
    })
  })

  invitations
    .filter(
      i =>
        i.invitedPersonType === 'REVIEWER' ||
        i.invitedPersonType === 'COLLABORATIVE_REVIEWER',
    )
    .map(i => ({ ...i, status: normalizeStatus(i.status) }))
    .forEach(invitation => {
      const existingReviewer = emailAndWebReviewers.find(
        r =>
          r.user &&
          (r.user.id === invitation.user?.id ||
            r.user.email === invitation.toEmail),
      )
      // TODO Currently, you can't reinvite someone who's already declined.
      // If we do allow this, we'll need to make sure we only merge one invite with the teamMember record, and only if the dates are correct.

      if (existingReviewer) {
        existingReviewer.isEmail = true

        const {
          isShared,
          user,
          userId,
          status,
          updated,
          ...invitationChosenFields
        } = invitation

        Object.assign(existingReviewer, invitationChosenFields)
      } else {
        emailAndWebReviewers.push({ ...invitation, isEmail: true })
      }
    })

  const LocalizedReviewFilterOptions = localizeReviewFilterOptions(statuses, t)

  emailAndWebReviewers.sort((a, b) => {
    const aDate = a.responseComment ? a.responseDate : a.updated
    const bDate = b.responseComment ? b.responseDate : b.updated
    return new Date(bDate) - new Date(aDate)
  })

  const allReviews = isCurrentVersion
    ? reviews
    : (Array.isArray(manuscript.reviews) &&
        manuscript.reviews.filter(review => !review.isDecision)) ||
      []

  const getReviewersWithoutDuplicates = (status, someReviewers) =>
    someReviewers
      .sort(
        (a, b) => (a.isEmail ? 0 : 1) - (b.isEmail ? 0 : 1), // to prioritize those with email sent
      )
      .filter((reviewer, index) => {
        const hasTheRightStatus =
          reviewer.status === normalizeStatus(status.value) ||
          (reviewer.status === 'closed' && status.value === 'completed')

        const isDuplicate =
          !!reviewer.user &&
          someReviewers.findIndex(r => r.user?.id === reviewer.user.id) !==
            index

        return hasTheRightStatus && !isDuplicate
      })

  const statusLabel = status => {
    return status?.value === 'completed'
      ? t('reviewerStatus.completedClosed')
      : status?.label
  }

  return (
    <AdminSection>
      <SectionContent>
        <SectionHeader>
          <ReviewerStatusHeader>
            <Title>{t('decisionPage.Reviewer Status')}</Title>
            <Title>
              <VersionNumber>
                {t('decisionPage.Version')} {versionNumber}
              </VersionNumber>
            </Title>
          </ReviewerStatusHeader>
        </SectionHeader>
        <SectionRow style={{ padding: 0 }}>
          <Kanban>
            {LocalizedReviewFilterOptions.filter(
              status =>
                !['rejected', 'closed'].includes(status.value.toLowerCase()),
            ).map(status => (
              <Column key={status.value}>
                <StatusLabel
                  lightText={status.lightText}
                  statusColor={status.color}
                >
                  {statusLabel(status)}
                </StatusLabel>
                <CardsWrapper>
                  {getReviewersWithoutDuplicates(
                    status,
                    emailAndWebReviewers,
                  ).map(reviewer => (
                    <KanbanCard
                      createFile={createFile}
                      currentUser={currentUser}
                      deleteFile={deleteFile}
                      isCurrentVersion={isCurrentVersion}
                      isInvitation={reviewer.isEmail}
                      key={reviewer.id}
                      manuscript={version}
                      removeInvitation={removeInvitation}
                      removeReviewer={removeReviewer}
                      review={
                        status.value === 'completed' ||
                        (status.value === 'inProgress' &&
                          reviewer.isCollaborative === true)
                          ? findReviewFromReviewer(allReviews, reviewer)
                          : null
                      }
                      reviewer={reviewer}
                      reviewForm={reviewForm}
                      showEmailInvitation={
                        reviewer.isEmail && status.value === 'invited'
                      }
                      status={
                        status.value === 'completed' && reviewer.isCollaborative
                          ? 'closed'
                          : status.value
                      }
                      updateCollaborativeTeamMember={
                        updateCollaborativeTeamMember
                      }
                      updateReview={updateReview}
                      updateReviewJsonData={updateReviewJsonData}
                      updateSharedStatusForInvitedReviewer={
                        updateSharedStatusForInvitedReviewer
                      }
                      updateTeamMember={updateTeamMember}
                    />
                  ))}
                </CardsWrapper>
              </Column>
            ))}
          </Kanban>
          <ReviewersDeclined emailAndWebReviewers={emailAndWebReviewers} />
        </SectionRow>
      </SectionContent>
    </AdminSection>
  )
}

KanbanBoard.propTypes = {
  versionNumber: PropTypes.number.isRequired,
}

export default KanbanBoard
