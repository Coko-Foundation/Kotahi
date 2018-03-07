import React from 'react'
import { withJournal } from 'xpub-journal'
import DecisionReview from './DecisionReview'

// TODO: read reviewer ordinal and name from project reviewer

const DecisionReviews = ({ journal, version }) => (
  <div>
    {version.reviewers &&
      version.reviewers
        .filter(review => review.submitted)
        .map((review, index) => (
          <div key={review.id}>
            <DecisionReview
              open
              review={review}
              reviewer={{
                name: review._user.username,
                ordinal: index + 1,
              }}
            />
          </div>
        ))}
  </div>
)

export default withJournal(DecisionReviews)
