import React from 'react'
import { withJournal } from 'xpub-journal'
import DecisionReview from './DecisionReview'
import classes from './DecisionReviews.local.scss'

// TODO: read reviewer ordinal and name from project reviewer

const DecisionReviews = ({ journal, version }) => (
  <div className={classes.root}>
    {version.reviewers &&
      version.reviewers
        .filter(review => review.submitted)
        .map((review, index) => (
          <div className={classes.review} key={review.id}>
            <DecisionReview
              open
              review={review}
              reviewer={{
                name: null,
                ordinal: index + 1,
              }}
            />
          </div>
        ))}
  </div>
)

export default withJournal(DecisionReviews)
