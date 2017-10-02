import React from 'react'
import { map } from 'lodash'
import Moment from 'react-moment'
import classes from './Reviewer.local.scss'
import { Avatar, Button } from 'xpub-ui'

const ordinalLetter = ordinal => {
  return ordinal ? String.fromCharCode(96 + ordinal) : null
}

const Reviewer = ({ reviewer, removeReviewer }) => (
  <div className={classes.root}>
    <Avatar
      status={reviewer.status}
      width={100}
      height={70}
      reviewerLetter={ordinalLetter(reviewer._reviewer.ordinal)}
    />
    <div className={classes.name}>
      {reviewer._user.username}
    </div>
    <div>
      {map(reviewer.events, (event, key) => (
        <div className={classes.date}>
          {key} on <Moment format="YYYY-MM-DD">{event}</Moment>
        </div>
      ))}
    </div>
    {reviewer.status === 'Pending' && (
      <Button onClick={removeReviewer}>x</Button>
    )}
  </div>
)

export default Reviewer
