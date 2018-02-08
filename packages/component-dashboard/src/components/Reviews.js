import React from 'react'
import { compose, withProps } from 'recompose'
import { groupBy } from 'lodash'
import { Badge } from '@pubsweet/ui'
import classes from './Reviews.local.scss'

const Reviews = ({ reviews }) => (
  <div className={classes.root}>
    {['invited', 'accepted', 'rejected', 'completed'].map(status => (
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
  withProps(props => ({
    reviews: groupBy(props.version.reviewers, 'status'),
  })),
)(Reviews)
