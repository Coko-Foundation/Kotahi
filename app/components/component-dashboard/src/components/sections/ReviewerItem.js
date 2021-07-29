import React from 'react'
import { useHistory } from 'react-router-dom'
import { Action, ActionGroup } from '@pubsweet/ui'
// import Authorize from 'pubsweet-client/src/helpers/Authorize'
import PropTypes from 'prop-types'
import config from 'config'
import { Item } from '../../style'
import { ClickableSectionRow } from '../../../../shared'

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

  const history = useHistory()

  const mainActionLink =
    status === 'invited' || status === 'rejected'
      ? `${urlFrag}/versions/${version.id}/reviewPreview`
      : `${urlFrag}/versions/${version.id}/review`

  return (
    <div
      onClick={() => history.push(mainActionLink)}
      onKeyDown={e => e.key === 'Enter' && history.push(mainActionLink)}
      role="button"
      tabIndex={0}
    >
      <ClickableSectionRow>
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
                onClick={() =>
                  reviewerRespond({
                    variables: {
                      currentUserId: currentUser.id,
                      action: 'accepted',
                      teamId: team.id,
                    },
                  })
                }
              >
                Accept
              </Action>
              <Action
                onClick={() =>
                  reviewerRespond({
                    variables: {
                      currentUserId: currentUser.id,
                      action: 'rejected',
                      teamId: team.id,
                    },
                  })
                }
              >
                Reject
              </Action>
            </ActionGroup>
          )}
          {status === 'rejected' && 'rejected'}
        </Item>
      </ClickableSectionRow>
    </div>
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
}

export default ReviewerItem
