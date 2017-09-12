import React from 'react'
import { compose, withState, withHandlers } from 'recompose'
import { withJournal } from 'xpub-journal'
import Review from './Review'
import classes from './DecisionReview.local.scss'

const DecisionReview = ({ review, reviewer, journal, open, toggleOpen }) => (
  <div>
    <div className={classes.heading}>
      <span
        className={classes.indicator}
        style={{
          backgroundColor: journal.recommendations
            .find(item => item.value === review.recommendation)
            .color
        }}/>

      <span className={classes.ordinal}>
        Review {reviewer.ordinal}
      </span>

      <span className={classes.name}>
        {reviewer.name || 'Anonymous'}
      </span>

      <span className={classes.dots}/>

      <button
        className={classes.toggle}
        onClick={toggleOpen}
        >{ open ? 'Hide' : 'Show' }</button>
    </div>

    {open && (
      <div className={classes.review}>
        <Review review={review}/>
      </div>
    )}
  </div>
)

export default compose(
  withJournal,
  withState('open', 'setOpen', ({ open }) => open),
  withHandlers({
    toggleOpen: props => () => {
      console.log(props)
      props.setOpen(open => !open)
    }
  })
)(DecisionReview)
