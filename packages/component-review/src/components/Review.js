import React from 'react'
import { NoteViewer } from 'xpub-edit'
import classes from './Review.local.scss'

const Review = ({ review }) => (
  <div>
    <div>
      <div className={classes.heading}>
        Review
      </div>

      <NoteViewer value={review.note}/>
    </div>

    {review.confidential && (
      <div>
        <div className={classes.heading}>
          Confidential
        </div>

        <NoteViewer value={review.confidential}/>
      </div>
    )}

    <div>
      <div className={classes.heading}>
        Recommendation
      </div>

      <div>{review.recommendation}</div>
    </div>
  </div>
)

export default Review
