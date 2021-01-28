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

const DecisionReviews = ({ manuscript }) => (
  <SectionContent>
    <SectionHeader>
      <Title>Reviews</Title>
    </SectionHeader>
    {manuscript.reviews && manuscript.reviews.length ? (
      manuscript.reviews
        .filter(
          review =>
            getCompletedReviews(manuscript, review.user) === 'completed' &&
            review.isDecision === false,
        )
        .map((review, index) => (
          <SectionRow key={review.id}>
            <DecisionReview
              open
              review={review}
              reviewer={{
                name: review.user.username,
                ordinal: index + 1,
              }}
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

DecisionReviews.propTypes = {
  manuscript: PropTypes.element.isRequired,
}

export default DecisionReviews
