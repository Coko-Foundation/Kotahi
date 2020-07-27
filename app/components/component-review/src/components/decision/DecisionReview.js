import React, { useContext } from 'react'
import styled from 'styled-components'
import { compose, withState, withHandlers } from 'recompose'
import { Button } from '@pubsweet/ui'
import { th } from '@pubsweet/ui-toolkit'
import { JournalContext } from '../../../../xpub-journal/src'
import Review from '../review/Review'

const ToggleReview = ({ open, toggle }) => (
  <Button onClick={toggle} plain>
    {open ? 'Hide' : 'Show'}
  </Button>
)

const Bullet = ({ journal, recommendation }) => {
  const recommendationColor = () =>
    recommendation
      ? journal.recommendations.find(item => item.value === recommendation)
          .color
      : 'black'

  const Dot = styled.span`
    border-radius: 100%;
    display: inline-block;
    height: 10px;
    margin-right: 10px;
    width: 10px;
    background-color: ${recommendationColor};
  `

  return <Dot />
}

const ReviewHeading = ({
  journal,
  name,
  open,
  ordinal,
  recommendation,
  toggleOpen,
}) => {
  const Root = styled.div`
    display: flex;
    align-items: baseline;
  `
  const Ordinal = styled.span``
  const Name = styled.span``
  const Controls = styled.span`
    flex-grow: 1;
    text-align: right;
  `

  return (
    <Root>
      <Bullet journal={journal} recommendation={recommendation} />
      <Ordinal>Review {ordinal}</Ordinal>
      &nbsp;
      <Name>{name || 'Anonymous'}</Name>
      <Controls>
        <ToggleReview open={open} toggle={toggleOpen} />
      </Controls>
    </Root>
  )
}

const DecisionReview = ({ review, reviewer, open, toggleOpen }) => {
  const { recommendation } = review
  const { name, ordinal } = reviewer

  const Root = styled.div`
    margin-bottom: calc(${th('gridUnit')} * 3);
  `

  const ReviewBody = styled.div`
    margin-left: 1em;
  `

  const journal = useContext(JournalContext)
  return (
    <Root>
      <ReviewHeading
        journal={journal}
        name={name}
        open={open}
        ordinal={ordinal}
        recommendation={recommendation}
        toggleOpen={toggleOpen}
      />

      {open && (
        <ReviewBody>
          <Review review={review} />
        </ReviewBody>
      )}
    </Root>
  )
}

export default compose(
  withState('open', 'setOpen', ({ open }) => open),
  withHandlers({
    toggleOpen: props => () => {
      props.setOpen(open => !open)
    },
  }),
)(DecisionReview)
