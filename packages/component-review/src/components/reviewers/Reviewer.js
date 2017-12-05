import React from 'react'
import { map } from 'lodash'
import Moment from 'react-moment'
import { Avatar, Button } from 'xpub-ui'

import classes from './Reviewer.local.scss'

const ordinalLetter = ordinal =>
  ordinal ? String.fromCharCode(96 + ordinal) : null

const Reviewer = ({ reviewer, removeReviewer }) => (
  <div className={classes.root}>
    <Avatar
      height={70}
      reviewerLetter={ordinalLetter(reviewer._reviewer.ordinal)}
      status={reviewer.status}
      width={100}
    />
    <div className={classes.name}>{reviewer._user.username}</div>
    <div>
      {map(reviewer.events, (event, key) => (
        <div className={classes.date} key={`${key}-${event}`}>
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
