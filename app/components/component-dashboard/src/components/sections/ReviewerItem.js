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

const ReviewerItem = ({
  version,
  currentUser,
  reviewerRespond,
  refetchReviewer,
}) => {
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
            onClick={async () => {
              await reviewerRespond({
                variables: {
                  currentUserId: currentUser.id,
                  action: 'accepted',
                  teamId: team.id,
                },
              })
              await refetchReviewer()
            }}
          >
            Accept
          </Action>
          <Action
            onClick={async () => {
              await reviewerRespond({
                variables: {
                  currentUserId: currentUser.id,
                  action: 'rejected',
                  teamId: team.id,
                },
              })
              refetchReviewer()
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
  version: PropTypes.shape({
    id: PropTypes.string.isRequired,
    meta: PropTypes.shape({
      title: PropTypes.string.isRequired,
    }).isRequired,
    teams: PropTypes.arrayOf(
      PropTypes.shape({
        role: PropTypes.string.isRequired,
        members: PropTypes.arrayOf(
          PropTypes.shape({
            user: PropTypes.shape({
              id: PropTypes.string.isRequired,
            }).isRequired,
          }).isRequired,
        ).isRequired,
      }).isRequired,
    ).isRequired,
  }).isRequired,
  currentUser: PropTypes.oneOfType([PropTypes.object]).isRequired,
  reviewerRespond: PropTypes.func.isRequired,
  refetchReviewer: PropTypes.func.isRequired,
}

export default ReviewerItem
