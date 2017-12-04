import React from 'react'
import classes from './Status.local.css'

// TODO: move labels to journal config

const labels = {
  accepted: 'Accepted',
  assignedToEditor: 'Assigned to editor',
  assigningReviewers: 'Assigning reviewers',
  new: 'Unsubmitted',
  submitted: 'Submitted',
}

const Status = ({ status }) => (
  <div className={classes.root}>{labels[status] || 'Unsubmitted'}</div>
)

export default Status
