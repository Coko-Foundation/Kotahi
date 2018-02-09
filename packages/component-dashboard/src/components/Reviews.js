import React from 'react'
import { compose, withProps } from 'recompose'
import { groupBy } from 'lodash'
import { withJournal } from 'xpub-journal'
import { Badge } from '@pubsweet/ui'
import classes from './Reviews.local.scss'

const Reviews = ({ reviews, journal }) => (
  <div className={classes.root}>
    {journal.reviewStatus.map(status => (
      <span className={classes.badge} key={status}>
        <Badge
          count={reviews[status] ? reviews[status].length : 0}
          label={status}
        />
      </span>
    ))}
  </div>
)

export default compose(
  withJournal,
  withProps(props => ({
    reviews: groupBy(props.version.reviewers, 'status'),
  })),
)(Reviews)
