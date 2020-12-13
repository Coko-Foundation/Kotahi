/* eslint-disable react/prop-types */
/* eslint-disable no-shadow */

import React from 'react'
import { Action, ActionGroup } from '@pubsweet/ui'
// import Authorize from 'pubsweet-client/src/helpers/Authorize'
import { Item } from '../../style'

import VersionTitle from './VersionTitle'

// TODO: only return links if version id is in reviewer.accepted array
// TODO: only return actions if not accepted or rejected
// TODO: review id in link

const ReviewerItem = ({ version, journals, currentUser, reviewerRespond }) => {
  const team =
    (version.teams || []).find(team => team.role === 'reviewer') || {}

  const currentMember =
    team.members &&
    team.members.find(member => member.user.id === currentUser.id)

  const status = currentMember && currentMember.status

  return (
    <Item>
      <VersionTitle version={version} />

      {(status === 'accepted' || status === 'completed') && (
        <ActionGroup>
          <Action to={`/journal/versions/${version.id}/review`}>
            {status === 'completed' ? 'Completed' : 'Do Review'}
          </Action>
        </ActionGroup>
      )}

      {status === 'invited' && (
        <ActionGroup>
          <Action
            data-testid="accept-review"
            onClick={() => {
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
          <Action
            onClick={() => {
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
      )}
      {status === 'rejected' && 'rejected'}
    </Item>
  )
}

export default ReviewerItem
