import React from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import DecisionReview from './DecisionReview'
import { SectionHeader, SectionRow, Title } from '../style'
import { SectionContent } from '../../../../shared'
import InvitationResults from './InvitationResults'

// TODO: read reviewer ordinal and name from project reviewer
// const { status } =
//     getUserFromTeam(manuscript, 'reviewer').filter(
//       member => member.user.id === currentUser.id,
//     )[0] || {}
//   return status

const getReviewerTeamMember = (manuscript, currentUser) => {
  const team = manuscript.teams.find(team_ => team_.role === 'reviewer') || {}

  if (!team.members) {
    return null
  }

  const currentMember = team.members.find(m => m.user?.id === currentUser?.id)
  return currentMember
}

const DecisionReviews = ({
  reviewers,
  reviewForm,
  manuscript,
  updateReview,
  canHideReviews,
  threadedDiscussionProps,
  invitations,
  urlFrag,
  updateSharedStatusForInvitedReviewer,
  updateTeamMember,
  currentUser,
}) => {
  const reviewsToShow = manuscript?.reviews?.length
    ? manuscript.reviews.filter(
        review =>
          getReviewerTeamMember(manuscript, review.user)?.status ===
            'completed' && review.isDecision === false,
      )
    : []

  const { t } = useTranslation()
  return (
    <SectionContent>
      <SectionHeader>
        <Title>{t('decisionPage.decisionTab.Completed Reviews')}</Title>
      </SectionHeader>
      <InvitationResults invitations={invitations} />
      {reviewsToShow.length > 0 ? (
        reviewsToShow
          .sort((reviewOne, reviewTwo) => {
            // Get the username of reviewer and convert to uppercase
            const usernameOne = reviewOne.user.username.toUpperCase()
            const usernameTwo = reviewTwo.user.username.toUpperCase()

            // Sort by username
            if (usernameOne < usernameTwo) return -1
            if (usernameOne > usernameTwo) return 1

            // If the username don't match then sort by reviewId
            if (reviewOne.id < reviewTwo.id) return -1
            if (reviewOne.id > reviewTwo.id) return 1

            return 0
          })
          .map((review, index) => (
            <SectionRow key={review.id}>
              <DecisionReview
                canHideReviews={canHideReviews}
                currentUser={currentUser}
                isControlPage
                manuscriptId={manuscript.id}
                open
                review={review}
                reviewer={{ user: review.user, ordinal: index + 1 }}
                reviewerTeamMember={getReviewerTeamMember(
                  manuscript,
                  review.user,
                )}
                reviewForm={reviewForm}
                teams={manuscript.teams}
                threadedDiscussionProps={threadedDiscussionProps}
                updateReview={updateReview}
                updateSharedStatusForInvitedReviewer={
                  updateSharedStatusForInvitedReviewer
                }
                updateTeamMember={updateTeamMember}
              />
            </SectionRow>
          ))
      ) : (
        <SectionRow>{t('decisionPage.decisionTab.noReviews')}</SectionRow>
      )}
    </SectionContent>
  )
}

DecisionReviews.propTypes = {
  manuscript: PropTypes.shape({
    id: PropTypes.string.isRequired,
    reviews: PropTypes.arrayOf(
      PropTypes.shape({
        user: PropTypes.shape({
          id: PropTypes.string.isRequired,
        }).isRequired,
      }).isRequired,
    ).isRequired,
    teams: PropTypes.arrayOf(
      PropTypes.shape({
        role: PropTypes.string.isRequired,
        members: PropTypes.arrayOf(
          PropTypes.shape({
            user: PropTypes.shape({
              id: PropTypes.string.isRequired,
            }).isRequired,
          }).isRequired,
        ).isRequired,
      }).isRequired,
    ).isRequired,
  }).isRequired,
  currentUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
}

export default DecisionReviews
