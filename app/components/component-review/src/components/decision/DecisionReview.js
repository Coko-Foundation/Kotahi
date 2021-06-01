import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Button } from '@pubsweet/ui'
import { th } from '@pubsweet/ui-toolkit'
import { JournalContext } from '../../../../xpub-journal/src'
import Review from '../review/Review'
import useCurrentUser from '../../../../../hooks/useCurrentUser'

const ToggleReview = ({ open, toggle }) => (
  <Button onClick={toggle} plain>
    {open ? 'Hide' : 'Show'}
  </Button>
)

const Bullet = styled.span`
  background-color: black;
  background-color: ${props =>
    props.recommendation
      ? props.journal.recommendations.find(
          item => item.value === props.recommendation,
        ).color
      : 'black'};
  border-radius: 100%;
  display: inline-block;
  height: 10px;
  margin-right: 10px;
  width: 10px;
`

const ReviewHeadingRoot = styled.div`
  align-items: baseline;
  display: flex;
`

const Ordinal = styled.span``
const Name = styled.span``

const Controls = styled.span`
  flex-grow: 1;
  text-align: right;
`

const ReviewHeading = ({
  journal,
  name,
  open,
  ordinal,
  recommendation,
  toggleOpen,
}) => {
  return (
    <ReviewHeadingRoot>
      <Bullet journal={journal} recommendation={recommendation} />
      <Ordinal>Review {ordinal}</Ordinal>
      &nbsp;
      <Name>{name || 'Anonymous'}</Name>
      <Controls>
        <ToggleReview open={open} toggle={toggleOpen} />
      </Controls>
    </ReviewHeadingRoot>
  )
}

const Root = styled.div`
  margin-bottom: calc(${th('gridUnit')} * 3);
`

const ReviewBody = styled.div`
  margin-left: 1em;
`

const DecisionReview = ({ review, reviewer }) => {
  const currentUser = useCurrentUser()
  const { recommendation } = review
  const { name, ordinal } = reviewer

  const journal = useContext(JournalContext)

  const [open, setOpen] = useState(false)
  const toggleOpen = () => setOpen(!open)

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
          <Review review={review} user={currentUser} />
        </ReviewBody>
      )}
    </Root>
  )
}

DecisionReview.propTypes = {
  // eslint-disable-next-line
  review: PropTypes.object,
  // eslint-disable-next-line
  reviewer: PropTypes.object,
}

ReviewHeading.propTypes = {
  // eslint-disable-next-line
  journal: PropTypes.object,
  name: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  ordinal: PropTypes.number.isRequired,
  recommendation: PropTypes.string.isRequired,
  toggleOpen: PropTypes.func.isRequired,
}
ToggleReview.propTypes = {
  open: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
}

Bullet.propTypes = {
  // eslint-disable-next-line
  journal: PropTypes.object,
  recommendation: PropTypes.string.isRequired,
}

export default DecisionReview
