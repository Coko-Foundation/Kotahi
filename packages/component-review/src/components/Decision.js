import React from 'react'
import { NoteViewer } from 'xpub-edit'
import { Attachment } from 'xpub-ui'
import classes from './Decision.local.scss'

const Decision = ({ decision }) => (
  <div>
    <div>
      <div className={classes.heading}>
        Note
      </div>

      <div className={classes.note}>
        <NoteViewer value={decision.note.content}/>

        {decision.note.attachments
          && decision.note.attachments.map(attachment => (
          <Attachment value={attachment}/>
        ))}
      </div>
    </div>

    <div>
      <div className={classes.heading}>
        Decision
      </div>

      <div>{decision.recommendation}</div>
    </div>
  </div>
)

export default Decision
