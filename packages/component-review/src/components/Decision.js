import React from 'react'
import { NoteViewer } from 'xpub-edit'
import classes from './Decision.local.scss'

const Decision = ({ decision }) => (
  <div>
    <div>
      <div className={classes.heading}>
        Note
      </div>

      <NoteViewer value={decision.note}/>
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
