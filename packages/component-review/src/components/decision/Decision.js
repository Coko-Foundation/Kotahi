import React from 'react'
import { NoteViewer } from 'xpub-edit'
import { Attachment } from '@pubsweet/ui'
import classes from './Decision.local.scss'

const Decision = ({ decision }) => (
  <div>
    <div>
      <div className={classes.heading}>Note</div>

      <div className={classes.note}>
        <div className={classes.content}>
          <NoteViewer value={decision.note.content} />
        </div>

        {decision.note.attachments &&
          decision.note.attachments.map(attachment => (
            <Attachment key={attachment.url} value={attachment} />
          ))}
      </div>
    </div>

    <div>
      <div className={classes.heading}>Decision</div>

      <div className={classes.decision}>{decision.recommendation}</div>
    </div>
  </div>
)

export default Decision
