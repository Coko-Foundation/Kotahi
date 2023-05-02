import React from 'react'
import PropTypes from 'prop-types'
import Review from './Review'
import { Title, SectionHeader, SectionRow } from '../style'
import { SectionContent } from '../../../../shared'

/** Some reviewers may be marked as 'shared', meaning they can see each other's reviews. Non-'shared' reviewers cannot see or be seen by this group.
 * This displays completed reviews by other shared reviewers IF the current user is in the shared group.
 */
const SharedReviewerGroupReviews = ({
  manuscript,
  reviewerId,
  reviewForm,
  threadedDiscussionProps,
}) => {
  const membersInSharedGroup = manuscript.teams
    ?.find(t => t.role === 'reviewer')
    ?.members?.filter(m => m.isShared)

  if (!membersInSharedGroup) return null

  const currentUserIsInSharedGroup = membersInSharedGroup.some(
    m => m.user.id === reviewerId,
  )

  if (!currentUserIsInSharedGroup) return null

  const otherCompletedSharedReviewerIds = membersInSharedGroup
    .filter(m => m.user.id !== reviewerId && m.status === 'completed')
    .map(m => m.user.id)

  const otherSharedReviews = manuscript.reviews?.filter(
    r =>
      r.user.id !== reviewerId &&
      !r.isDecision &&
      otherCompletedSharedReviewerIds.includes(r.user.id),
  )

  if (!otherSharedReviews?.length) return null

  return (
    <SectionContent>
      <SectionHeader>
        <Title>Other Reviews</Title>
      </SectionHeader>
      {otherSharedReviews.map(r => (
        <SectionRow key={r.id}>
          <Review
            review={r}
            reviewForm={reviewForm}
            threadedDiscussionProps={threadedDiscussionProps}
          />
        </SectionRow>
      ))}
    </SectionContent>
  )
}

SharedReviewerGroupReviews.propTypes = {
  manuscript: PropTypes.shape({
    teams: PropTypes.arrayOf(
      PropTypes.shape({
        role: PropTypes.string.isRequired,
        members: PropTypes.arrayOf(
          PropTypes.shape({
            isShared: PropTypes.bool,
            status: PropTypes.string,
            user: PropTypes.shape({ id: PropTypes.string.isRequired })
              .isRequired,
          }).isRequired,
        ).isRequired,
      }).isRequired,
    ).isRequired,
    reviews: PropTypes.arrayOf(
      PropTypes.shape({
        isDecision: PropTypes.bool.isRequired,
        user: PropTypes.shape({ id: PropTypes.string.isRequired }).isRequired,
      }).isRequired,
    ).isRequired,
  }).isRequired,
  reviewerId: PropTypes.string.isRequired,
}

export default SharedReviewerGroupReviews
