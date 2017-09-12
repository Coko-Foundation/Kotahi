import React from 'react'
import { withJournal } from 'xpub-journal'
import DecisionReview from './DecisionReview'
import classes from './DecisionReviews.local.scss'

// TODO: read reviewer ordinal and name from project reviewer

const DecisionReviews = ({ journal, reviews }) => (
  <div>
    {reviews.map((review, index) => (
      <div className={classes.review}>
        <DecisionReview
          key={review.id}
          review={review}
          reviewer={{
            name: null,
            ordinal: index + 1
          }}/>
      </div>
    ))}
  </div>
)

export default withJournal(DecisionReviews)
