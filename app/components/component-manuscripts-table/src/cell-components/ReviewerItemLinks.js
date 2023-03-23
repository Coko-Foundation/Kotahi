import React from 'react'
import { useHistory } from 'react-router-dom'
import { th } from '@pubsweet/ui-toolkit'
import { Action, ActionGroup } from '@pubsweet/ui'
import styled from 'styled-components'

const Divider = styled.div`
  background-image: linear-gradient(
    ${th('colorSecondary')},
    ${th('colorSecondary')}
  );
  background-position: center center;
  background-repeat: no-repeat;
  background-size: 1px 100%;
`

const ReviewerItemLinks = ({
  manuscript,
  urlFrag,
  reviewerRespond,
  currentUser,
  updateReviewerStatus,
  setMainActionLink,
}) => {
  const team =
    (manuscript.teams || []).find(team_ => team_.role === 'reviewer') || {}

  const currentMember =
    team.members &&
    team.members.find(member => member.user.id === currentUser.id)

  const status = currentMember && currentMember.status

  const history = useHistory()

  const mainActionLink =
    status === 'invited' || status === 'rejected'
      ? `${urlFrag}/versions/${manuscript.id}/reviewPreview`
      : `${urlFrag}/versions/${manuscript.parentId || manuscript.id}/review`

  // The timeout is a hack to avoid "Cannot update component while rendering a different component" error
  // TODO Having a subcomponent determine the state of its parent is poor design. This state should be determined higher up and passed down.
  setTimeout(() => setMainActionLink(mainActionLink), 10)

  const reviewLinkText = {
    completed: 'Completed',
    accepted: 'Do Review',
    inProgress: 'Continue Review',
  }

  if (['accepted', 'completed', 'inProgress'].includes(status)) {
    return (
      <ActionGroup>
        <Action
          onClick={async e => {
            e.stopPropagation()
            // on click, update review status before forwarding to link

            if (status === 'accepted') {
              await updateReviewerStatus({
                variables: {
                  manuscriptId: manuscript.id,
                  status: 'inProgress',
                },
              })
            }

            history.push(mainActionLink)
          }}
        >
          {reviewLinkText[status]}
        </Action>
      </ActionGroup>
    )
  }

  if (status === 'invited') {
    return (
      <ActionGroup>
        <Action
          data-testid="accept-review"
          onClick={e => {
            e.stopPropagation()
            reviewerRespond({
              variables: {
                currentUserId: currentUser.id,
                action: 'accepted',
                teamId: team.id,
              },
            })
          }}
        >
          Accept
        </Action>
        <Divider>&nbsp;</Divider>
        <Action
          data-testid="reject-review"
          onClick={e => {
            e.stopPropagation()
            reviewerRespond({
              variables: {
                currentUserId: currentUser.id,
                action: 'rejected',
                teamId: team.id,
              },
            })
          }}
        >
          Reject
        </Action>
      </ActionGroup>
    )
  }

  return (
    <ActionGroup>
      <Action disabled>{status}</Action>
    </ActionGroup>
  )
}

export default ReviewerItemLinks
