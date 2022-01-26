import React from 'react'
import { Action } from '@pubsweet/ui'
import PropTypes from 'prop-types'
import config from 'config'
import DecisionReview from './DecisionReview'
import { SectionHeader, SectionRow, Title } from '../style'
import { SectionContent } from '../../../../shared'

// TODO: read reviewer ordinal and name from project reviewer
// const { status } =
//     getUserFromTeam(manuscript, 'reviewer').filter(
//       member => member.user.id === currentUser.id,
//     )[0] || {}
//   return status

const getCompletedReviews = (manuscript, currentUser) => {
  const team = manuscript.teams.find(team_ => team_.role === 'reviewer') || {}

  if (!team.members) {
    return null
  }

  const currentMember = team.members.find(m => m.user?.id === currentUser?.id)
  return currentMember && currentMember.status
}

const urlFrag = config.journal.metadata.toplevel_urlfragment

const DecisionReviews = ({ manuscript, sharedReviews }) => {
  const reviews =
    process.env.INSTANCE_NAME === 'colab' ? sharedReviews : manuscript.reviews

  return (
    <SectionContent>
      <SectionHeader>
        <Title>Reviews</Title>
      </SectionHeader>
      {reviews && reviews.length ? (
        reviews
          .filter(
            review =>
              getCompletedReviews(manuscript, review.user) === 'completed' &&
              review.isDecision === false,
          )
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
                isControlPage
                manuscriptId={manuscript.id}
                open
                review={review}
                reviewer={{ user: review.user, ordinal: index + 1 }}
                teams={manuscript.teams}
              />
            </SectionRow>
          ))
      ) : (
        <SectionRow>No reviews completed yet.</SectionRow>
      )}
      <SectionRow>
        <Action to={`${urlFrag}/versions/${manuscript.id}/reviewers`}>
          Manage Reviewers
        </Action>
      </SectionRow>
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
}

export default DecisionReviews
