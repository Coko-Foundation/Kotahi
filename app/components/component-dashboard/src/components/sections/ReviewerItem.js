import React from 'react'
import { Action, ActionGroup } from '@pubsweet/ui'
// import Authorize from 'pubsweet-client/src/helpers/Authorize'
import PropTypes from 'prop-types'
import config from 'config'
import { Item } from '../../style'

import VersionTitle from './VersionTitle'

// TODO: only return links if version id is in reviewer.accepted array
// TODO: only return actions if not accepted or rejected
// TODO: review id in link

const ReviewerItem = ({ version, currentUser, reviewerRespond }) => {
  const team =
    (version.teams || []).find(team_ => team_.role === 'reviewer') || {}

  const currentMember =
    team.members &&
    team.members.find(member => member.user.id === currentUser.id)

  const status = currentMember && currentMember.status

  const urlFrag = config.journal.metadata.toplevel_urlfragment

  return (
    <Item>
      <VersionTitle version={version} />

      {(status === 'accepted' || status === 'completed') && (
        <ActionGroup>
          <Action to={`${urlFrag}/versions/${version.id}/review`}>
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

ReviewerItem.propTypes = {
  version: PropTypes.string.isRequired,
  currentUser: PropTypes.oneOfType([PropTypes.object]).isRequired,
  reviewerRespond: PropTypes.func.isRequired,
}

export default ReviewerItem
