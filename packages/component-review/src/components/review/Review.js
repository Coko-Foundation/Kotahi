import React from 'react'
import { NoteViewer } from 'xpub-edit'
import { Attachment } from 'xpub-ui'
import classes from './Review.local.scss'

const Review = ({ review }) => (
  <div>
    <div>
      <div className={classes.heading}>Note</div>

      <div className={classes.note}>
        <div className={classes.content}>
          <NoteViewer value={review.note.content} />
        </div>

        {review.note.attachments &&
          review.note.attachments.map(attachment => (
            <Attachment key={attachment.url} value={attachment} />
          ))}
      </div>
    </div>

    {review.confidential && (
      <div>
        <div className={classes.heading}>Confidential</div>

        <div className={classes.note}>
          <div className={classes.content}>
            <NoteViewer value={review.confidential.content} />
          </div>

          {review.confidential.attachments &&
            review.confidential.attachments.map(attachment => (
              <Attachment key={attachment.url} value={attachment} />
            ))}
        </div>
      </div>
    )}

    <div>
      <div className={classes.heading}>Recommendation</div>

      <div className={classes.recommendation}>{review.recommendation}</div>
    </div>
  </div>
)

export default Review
