import React from 'react'
import { Button } from '@pubsweet/ui'
import Authorize from 'pubsweet-client/src/helpers/Authorize'
import { Item, Body, Divider } from '../molecules/Item'
import { Links, LinkContainer } from '../molecules/Links'
import { Actions, ActionContainer } from '../molecules/Actions'

import JournalLink from '../JournalLink'
import VersionTitle from './VersionTitle'

// TODO: only return links if version id is in reviewer.accepted array
// TODO: only return actions if not accepted or rejected
// TODO: review id in link

const ReviewerItem = ({ version, journals, currentUser, reviewerRespond }) => {
  const team =
    (version.teams || []).find(team => team.role === 'reviewerEditor') || {}

  const currentMember =
    team.members &&
    team.members.find(member => member.user.id === currentUser.id)
  const status = currentMember && currentMember.status

  // Enable that when Team Models is updated
  // const { status } =
  //   getUserFromTeam(version, 'reviewerEditor').filter(
  //     member => member.id === currentUser.id,
  //   )[0] || {}

  const review =
    (version.reviews || []).find(
      review =>
        currentUser &&
        review.user &&
        review.user.id === currentUser.id &&
        !review.isDecision,
    ) || {}

  return (
    <Authorize
      key={`${review.id}`}
      object={[version]}
      operation="can view review section"
    >
      <Item>
        <Body>
          <VersionTitle version={version} />

          {(status === 'accepted' || status === 'completed') && (
            <Links>
              <LinkContainer>
                <JournalLink
                  id={version.id}
                  journal={journals}
                  page="reviews"
                  version={version}
                >
                  {status === 'completed' ? 'Completed' : 'Do Review'}
                </JournalLink>
              </LinkContainer>
            </Links>
          )}

          {status === 'invited' && (
            <Actions>
              <ActionContainer>
                <Button
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
        </Body>
      </Item>
    </Authorize>
  )
}

export default ReviewerItem
