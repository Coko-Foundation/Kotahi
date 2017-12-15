import React from 'react'
import { compose, withProps } from 'recompose'
import { groupBy } from 'lodash'
import { Badge } from '@pubsweet/ui'
import classes from './Reviews.local.scss'

const Reviews = ({ reviews }) => (
  <div className={classes.root}>
    {Object.keys(reviews).map(status => (
      <span className={classes.badge} key={status}>
        <Badge count={reviews[status].length} label={status} />
      </span>
    ))}
  </div>
)

export default compose(
  withProps(props => ({
    reviews: groupBy(props.version.reviewers, 'status'),
  })),
)(Reviews)
