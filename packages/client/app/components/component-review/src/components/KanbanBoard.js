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

const Kanban = styled.div`
  margin: 15px 7.5px;
`

const Column = styled.div`
  display: inline-block;
  height: 300px;
  margin-inline: 7.5px;
  width: calc(${100 / (statuses.length - 1)}% - 15px);
`

const StatusLabel = styled.div`
  background-color: ${props => props.statusColor || '#ffffff'};
  border-radius: 12px;
  color: ${props => (props.lightText ? '#ffffff' : '#000000')};
  display: inline-block;
  font-weight: bold;
  margin-block: 4px;
  padding: 4px 10px 4px 10px;
`

const CardsWrapper = styled.div`
  background-color: #f8f8f9;
  border-radius: 8px;
  height: 100%;
  margin-top: 8px;
  overflow-x: hidden;
  overflow-y: auto;
  width: 100%;
`

const ReviewerStatusHeader = styled.div`
  display: flex;
  justify-content: space-between;
`

const VersionNumber = styled.div`
  color: rgba(0, 0, 0, 0.5);
`

const KanbanBoard = ({
  invitations,
  version,
  versionNumber,
  removeReviewer,
  reviews,
  reviewForm,
  isCurrentVersion,
  manuscript,
  updateSharedStatusForInvitedReviewer,
  updateTeamMember,
  updateReview,
}) => {
  const reviewers = getMembersOfTeam(version, 'reviewer')
  const { t } = useTranslation()

  const emailAndWebReviewers = []

  reviewers.forEach(reviewer => {
    emailAndWebReviewers.push({
      ...reviewer,
      isEmail: false, // This will be revised to true if we find a matching invitation below
    })
  })

  invitations
    .filter(i => i.invitedPersonType === 'REVIEWER')
    .map(i => ({ ...i, status: i.status.toLowerCase() }))
    .forEach(invitation => {
      const existingReviewer = emailAndWebReviewers.find(
        r =>
          r.user.id === invitation.user?.id ||
          r.user.email === invitation.toEmail,
      )
      // TODO Currently, you can't reinvite someone who's already declined.
      // If we do allow this, we'll need to make sure we only merge one invite with the teamMember record, and only if the dates are correct.

      if (existingReviewer) {
        existingReviewer.isEmail = true

        const {
          id,
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

  const findReview = reviewer => {
    return allReviews.find(
      review =>
        review.user?.id === reviewer.user?.id && review.isDecision === false,
    )
  }

  const getReviewersWithoutDuplicates = (status, someReviewers) =>
    someReviewers
      .sort(
        (a, b) => (a.isEmail ? 0 : 1) - (b.isEmail ? 0 : 1), // to prioritize those with email sent
      )
      .filter((reviewer, index) => {
        const hasTheRightStatus =
          reviewer.status === status.value ||
          (reviewer.status === 'UNANSWERED' && status.value === 'invited')

        const isDuplicate =
          !!reviewer.user &&
          someReviewers.findIndex(r => r.user?.id === reviewer.user.id) !==
            index

        return hasTheRightStatus && !isDuplicate
      })

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
              status => !['rejected'].includes(status.value.toLowerCase()),
            ).map(status => (
              <Column key={status.value}>
                <StatusLabel
                  lightText={status.lightText}
                  statusColor={status.color}
                >
                  {status.label}
                </StatusLabel>
                <CardsWrapper>
                  {getReviewersWithoutDuplicates(
                    status,
                    emailAndWebReviewers,
                  ).map(reviewer => (
                    <KanbanCard
                      isCurrentVersion={isCurrentVersion}
                      isInvitation={reviewer.isEmail}
                      key={reviewer.id}
                      manuscript={version}
                      removeReviewer={removeReviewer}
                      review={
                        status.value === 'completed'
                          ? findReview(reviewer)
                          : null
                      }
                      reviewer={reviewer}
                      reviewForm={reviewForm}
                      showEmailInvitation={
                        reviewer.isEmail && status.value === 'invited'
                      }
                      status={status.value}
                      updateReview={updateReview}
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
