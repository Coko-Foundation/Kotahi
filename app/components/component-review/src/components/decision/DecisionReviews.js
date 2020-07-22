import React from 'react'
import DecisionReview from './DecisionReview'
import { Container, SectionHeader, SectionRow, Title } from '../style'
import { H1, Action } from '@pubsweet/ui'

// TODO: read reviewer ordinal and name from project reviewer
// const { status } =
//     getUserFromTeam(manuscript, 'reviewer').filter(
//       member => member.user.id === currentUser.id,
//     )[0] || {}
//   return status

const getCompletedReviews = (manuscript, currentUser) => {
  const team = manuscript.teams.find(team => team.role === 'reviewer') || {}
  if (!team.members) {
    return null
  }
  const currentMember = team.members.find(m => m.user.id === currentUser.id)
  return currentMember && currentMember.status
}

const DecisionReviews = ({ manuscript }) => (
  <Container>
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
      <SectionRow>
        <Action to={`/journal/versions/${manuscript.id}/reviewers`}>
          Assign Reviewers
        </Action>
      </SectionRow>
    )}
  </Container>
)

export default DecisionReviews
