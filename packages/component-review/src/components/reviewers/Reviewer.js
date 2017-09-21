import React from 'react'
import classes from './Reviewer.local.scss'
import { Avatar, Button } from 'xpub-ui'

const Reviewer = ({ reviewer, removeReviewer }) => {
  let interactionsArea
  if (reviewer.status && reviewer.status === 'Pending') {
    interactionsArea = <Button onClick={removeReviewer}>RESEND MAIL</Button>
  }

  return (
    <div className={classes.root}>
      {reviewer._user && (
        <div>
          <Avatar status={reviewer.status} width="100" height="70" />
          <div>{reviewer._user.fullname}</div>
          <div>
            <em>{`added on ${reviewer.addedOn}`}</em>
          </div>
          {interactionsArea}
        </div>
      )}
    </div>
  )
}
export default Reviewer
