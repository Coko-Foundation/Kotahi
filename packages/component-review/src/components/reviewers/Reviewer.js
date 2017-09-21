import React from 'react'
import classes from './Reviewer.local.scss'
import { Avatar } from 'xpub-ui'

const Reviewer = ({ reviewer, removeReviewer }) => (
  <div className={classes.root}>
    {reviewer._user && (
      <div>
        <Avatar status={reviewer.status} />
        <div>{reviewer._user.username}</div>
        <div>{reviewer._user.email}</div>
        <div>{`status: ${reviewer.status}`}</div>
        <div>{`added on ${reviewer.addedOn}`}</div>

        <button onClick={removeReviewer}>remove</button>
      </div>
    )}
  </div>
)

export default Reviewer
