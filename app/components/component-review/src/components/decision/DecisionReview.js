import React, { useContext, useState } from 'react'
import { useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Button, Checkbox } from '@pubsweet/ui'
import { th } from '@pubsweet/ui-toolkit'
import { JournalContext } from '../../../../xpub-journal/src'
import Review from '../review/Review'
import useCurrentUser from '../../../../../hooks/useCurrentUser'
import { updateReviewMutation } from '../queries'

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

const StyledCheckbox = styled(Checkbox)`
  margin-left: 10px;
`

const ReviewHeading = ({
  id,
  journal,
  name,
  open,
  ordinal,
  recommendation,
  isHiddenFromAuthor,
  isHiddenReviewerName,
  toggleOpen,
  manuscriptId,
  teams,
  currentUser,
}) => {
  if (!currentUser) return null

  const [updateReview] = useMutation(updateReviewMutation)

  const editorTeam = teams.filter(team => {
    return team.role.toLowerCase().includes('editor')
  })

  const authorTeam = teams.filter(team => {
    return team.role.toLowerCase().includes('author')
  })

  const isCurrentUserAuthor = authorTeam.length
    ? authorTeam[0].members[0].user.id === currentUser.id
    : false

  const isCurrentUserEditor = editorTeam.length
    ? !!editorTeam
        .map(team => team.members)
        .flat()
        .filter(member => member.user.id === currentUser.id).length
    : false

  const toggleIsHiddenFromAuthor = (reviewId, reviewHiddenFromAuthor) => {
    updateReview({
      variables: {
        id: reviewId,
        input: { isHiddenFromAuthor: reviewHiddenFromAuthor, manuscriptId },
      },
    })
  }

  const toggleIsHiddenReviewerNameFromPublishedAndAuthor = (
    reviewId,
    reviewerNameHiddenFromPublishedAndAuthor,
  ) => {
    updateReview({
      variables: {
        id: reviewId,
        input: {
          isHiddenReviewerName: reviewerNameHiddenFromPublishedAndAuthor,
          manuscriptId,
        },
      },
    })
  }

  return (
    <ReviewHeadingRoot>
      <Bullet journal={journal} recommendation={recommendation} />
      <Ordinal>Review {ordinal}</Ordinal>
      &nbsp;
      <Name>
        {isHiddenReviewerName && isCurrentUserAuthor ? 'Anonymous' : name}
      </Name>
      <Controls>
        <ToggleReview open={open} toggle={toggleOpen} />
      </Controls>
      {process.env.INSTANCE_NAME === 'colab' && isCurrentUserEditor && (
        <>
          <Checkbox
            checked={isHiddenFromAuthor}
            label="Hide review to author"
            onChange={() => toggleIsHiddenFromAuthor(id, !isHiddenFromAuthor)}
          />
          <StyledCheckbox
            checked={isHiddenReviewerName}
            label="Hide reviewer name"
            onChange={() =>
              toggleIsHiddenReviewerNameFromPublishedAndAuthor(
                id,
                !isHiddenReviewerName,
              )
            }
          />
        </>
      )}
    </ReviewHeadingRoot>
  )
}

const Root = styled.div`
  margin-bottom: calc(${th('gridUnit')} * 3);
`

const ReviewBody = styled.div`
  margin-left: 1em;
`

const DecisionReview = ({ review, reviewer, manuscriptId, teams }) => {
  const currentUser = useCurrentUser()

  const {
    recommendation,
    isHiddenFromAuthor,
    isHiddenReviewerName,
    id,
  } = review

  const { name, ordinal } = reviewer
  const journal = useContext(JournalContext)

  const [open, setOpen] = useState(false)
  const toggleOpen = () => setOpen(!open)

  return (
    <Root>
      <ReviewHeading
        currentUser={currentUser}
        id={id}
        isHiddenFromAuthor={isHiddenFromAuthor}
        isHiddenReviewerName={isHiddenReviewerName}
        journal={journal}
        manuscriptId={manuscriptId}
        name={name}
        open={open}
        ordinal={ordinal}
        recommendation={recommendation}
        teams={teams}
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
