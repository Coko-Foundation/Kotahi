import React from 'react'
import { Button } from '@pubsweet/ui'
// import Authorize from 'pubsweet-client/src/helpers/Authorize'
import {
  Item,
  Divider,
  Links,
  LinkContainer,
  Actions,
  ActionContainer,
} from '../../style'

import JournalLink from '../JournalLink'
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
        <Links>
          <LinkContainer>
            <JournalLink id={version.id} page="reviews" version={version}>
              {status === 'completed' ? 'Completed' : 'Do Review'}
            </JournalLink>
          </LinkContainer>
        </Links>
      )}

      {status === 'invited' && (
        <Actions>
          <ActionContainer>
            <Button
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
              accept
            </Button>
          </ActionContainer>

          <Divider separator="|" />

          <ActionContainer>
            <Button
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
              reject
            </Button>
          </ActionContainer>
        </Actions>
      )}
      {status === 'rejected' && 'rejected'}
    </Item>
  )
}

export default ReviewerItem
