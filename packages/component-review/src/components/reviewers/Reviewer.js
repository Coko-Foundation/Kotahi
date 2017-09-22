import React from 'react'
import classes from './Reviewer.local.scss'
import { Avatar, Button } from 'xpub-ui'

const Reviewer = ({ reviewer, removeReviewer }) => {
  return (
    <div className={classes.root}>
      {reviewer._user && (
        <div>
          <Avatar status={reviewer.status} width="100" height="70" />
          <div className={classes.fullname}>{reviewer._user.fullname}</div>
          <div className={classes.date}>added on {reviewer.addedOn}</div>
          {reviewer.status === 'Pending' && (
            <Button onClick={removeReviewer}>RESEND MAIL</Button>
          )}
        </div>
      )}
    </div>
  )
}
export default Reviewer
