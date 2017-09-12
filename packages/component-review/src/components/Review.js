import React from 'react'
import { NoteViewer } from 'xpub-edit'
import { Attachment } from 'xpub-ui'
import classes from './Review.local.scss'

const Review = ({ review }) => (
  <div>
    <div>
      <div className={classes.heading}>
        Note
      </div>

      <div className={classes.note}>
        <NoteViewer value={review.note.content}/>

        {review.note.attachments
          && review.note.attachments.map(attachment => (
          <Attachment value={attachment}/>
        ))}
      </div>
    </div>

    {review.confidential && (
      <div>
        <div className={classes.heading}>
          Confidential
        </div>

        <div className={classes.note}>
          <NoteViewer value={review.confidential.content}/>

          {review.confidential.attachments
            && review.confidential.attachments.map(attachment => (
            <Attachment value={attachment}/>
          ))}
        </div>
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
