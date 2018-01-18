import React from 'react'
import { compose, withState, withHandlers } from 'recompose'
import { withJournal } from 'xpub-journal'
import Review from '../review/Review'
import classes from './DecisionReview.local.scss'

const ToggleReview = ({ open, toggle }) => (
  <button className={classes.toggle} onClick={toggle}>
    {open ? 'Hide' : 'Show'}
  </button>
)

const Bullet = ({ journal, recommendation }) => {
  const recommendationColor = journal.recommendations.find(
    item => item.value === recommendation,
  ).color

  return (
    <span
      className={classes.indicator}
      style={{
        backgroundColor: recommendation ? recommendationColor : 'black',
      }}
    />
  )
}

const ReviewHeading = ({
  journal,
  name,
  open,
  ordinal,
  recommendation,
  toggleOpen,
}) => (
  <div className={classes.heading}>
    <Bullet journal={journal} recommendation={recommendation} />

    <span className={classes.ordinal}>Review {ordinal}</span>
    <span className={classes.name}>{name || 'Anonymous'}</span>

    <span className={classes.dots} />

    <ToggleReview open toggle={toggleOpen} />
  </div>
)

const DecisionReview = ({ review, reviewer, journal, open, toggleOpen }) => {
  const { recommendation } = review.Recommendation
  const { name, ordinal } = reviewer

  return (
    <div>
      <ReviewHeading
        journal={journal}
        name={name}
        open={open}
        ordinal={ordinal}
        recommendation={recommendation}
        toggleOpen={toggleOpen}
      />

      {open && (
        <div className={classes.review}>
          <Review review={review} />
        </div>
      )}
    </div>
  )
}

export default compose(
  withJournal,
  withState('open', 'setOpen', ({ open }) => open),
  withHandlers({
    toggleOpen: props => () => {
      props.setOpen(open => !open)
    },
  }),
)(DecisionReview)
