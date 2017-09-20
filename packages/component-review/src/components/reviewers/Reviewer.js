import React from 'react'
import classes from './Reviewer.local.scss'

const Reviewer = ({ reviewer, removeReviewer }) => (
  <div className={classes.root}>
    {reviewer._user && (
      <div>
        <div>{reviewer._user.username}</div>
        <div>{reviewer._user.email}</div>
      </div>
    )}

    <div>{reviewer.status}</div>
    <div>{`added on ${reviewer.addedOn}`}</div>

    <button onClick={removeReviewer}>remove</button>
  </div>
)

export default Reviewer
