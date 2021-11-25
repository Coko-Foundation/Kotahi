import React, { useContext, useState } from 'react'
import { useMutation, useQuery, gql } from '@apollo/client'
import PropTypes from 'prop-types'
import config from 'config'
import styled from 'styled-components'
import { Button, Checkbox } from '@pubsweet/ui'
import { th } from '@pubsweet/ui-toolkit'
import { JournalContext } from '../../../../xpub-journal/src'
import Review from '../review/Review'
import useCurrentUser from '../../../../../hooks/useCurrentUser'
import { updateReviewMutation } from '../queries'
import ShareIcon from '../../../../../shared/icons/share'

import {
  UserCombo,
  Primary,
  Secondary,
  UserInfo,
} from '../../../../component-manuscripts/src/style'
import { UserAvatar } from '../../../../component-avatar/src'

const GET_USER = gql`
  query user($id: ID, $username: String) {
    user(id: $id, username: $username) {
      id
      username
      profilePicture
    }
  }
`

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
  align-items: center;
  display: flex;
`

const Ordinal = styled.span``

const Name = styled.span`
  display: flex;
  margin-left: 1em;
`

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
  open,
  ordinal,
  recommendation,
  user,
  isHiddenFromAuthor,
  isHiddenReviewerName,
  toggleOpen,
  manuscriptId,
  teams,
  currentUser,
  canBePublishedPublicly,
  reviewUserId,
}) => {
  if (!currentUser) return null

  const { data } = useQuery(GET_USER, {
    variables: { username: user.username },
  })

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
        input: {
          isHiddenFromAuthor: reviewHiddenFromAuthor,
          manuscriptId,
          userId: reviewUserId,
        },
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
          userId: reviewUserId,
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
        {isHiddenReviewerName && isCurrentUserAuthor ? (
          'Anonymous'
        ) : (
          <UserCombo>
            <UserAvatar user={(data && data.user) || user} />
            <UserInfo>
              <Primary>{user.defaultIdentity.name}</Primary>
              <Secondary>{user.email || `(${user.username})`}</Secondary>
            </UserInfo>
          </UserCombo>
        )}
        {(isCurrentUserEditor || currentUser.admin) &&
          canBePublishedPublicly &&
          process.env.INSTANCE_NAME === 'colab' && (
            <>
              &nbsp;
              <ShareIcon />
            </>
          )}
      </Name>
      {config.review.hide === 'true' &&
        (isCurrentUserEditor || currentUser.admin) && (
          <>
            <StyledCheckbox
              checked={isHiddenFromAuthor || isHiddenFromAuthor == null}
              label="Hide review"
              onChange={() => toggleIsHiddenFromAuthor(id, !isHiddenFromAuthor)}
            />
            <StyledCheckbox
              checked={isHiddenReviewerName || isHiddenReviewerName == null}
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

const DecisionReview = ({ review, reviewer, manuscriptId, teams }) => {
  const currentUser = useCurrentUser()

  const {
    recommendation,
    isHiddenFromAuthor,
    isHiddenReviewerName,
    id,
    canBePublishedPublicly,
  } = review

  const { user, ordinal } = reviewer

  const journal = useContext(JournalContext)

  const [open, setOpen] = useState(false)
  const toggleOpen = () => setOpen(!open)

  return (
    <Root>
      <ReviewHeading
        canBePublishedPublicly={canBePublishedPublicly}
        currentUser={currentUser}
        id={id}
        isHiddenFromAuthor={isHiddenFromAuthor}
        isHiddenReviewerName={isHiddenReviewerName}
        journal={journal}
        manuscriptId={manuscriptId}
        open={open}
        ordinal={ordinal}
        recommendation={recommendation}
        reviewer={reviewer}
        reviewUserId={review.user.id}
        teams={teams}
        toggleOpen={toggleOpen}
        user={user}
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
  open: PropTypes.bool.isRequired,
  ordinal: PropTypes.number.isRequired,
  recommendation: PropTypes.string.isRequired,
  toggleOpen: PropTypes.func.isRequired,
  // eslint-disable-next-line
  user: PropTypes.object.isRequired,
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
