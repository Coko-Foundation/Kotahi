import React from 'react'
import { Button } from '@pubsweet/ui'
import { getReviewerFromUser } from 'xpub-selectors'

import { Item, Body, Divider } from '../molecules/Item'
import { Links, LinkContainer } from '../molecules/Links'
import { Actions, ActionContainer } from '../molecules/Actions'

import ProjectLink from '../ProjectLink'
import VersionTitle from './VersionTitle'

// TODO: only return links if version id is in reviewer.accepted array
// TODO: only return actions if not accepted or rejected
// TODO: review id in link

const ReviewerItem = ({ project, version, currentUser, reviewerResponse }) => {
  const reviewer = getReviewerFromUser(project, version, currentUser)
  const status = reviewer && reviewer.status

  return (
    <Item>
      <Body>
        <VersionTitle version={version} />

        {(status === 'accepted' || status === 'completed') && (
          <Links>
            <LinkContainer>
              <ProjectLink
                id={reviewer.id}
                page="reviews"
                project={project}
                version={version}
              >
                {reviewer.submitted ? 'Completed' : 'Do Review'}
              </ProjectLink>
            </LinkContainer>
          </Links>
        )}

        {status === 'invited' && (
          <Actions>
            <ActionContainer>
              <Button
                onClick={() =>
                  reviewerResponse(project, version, reviewer, 'accepted')
                }
              >
                accept
              </Button>
            </ActionContainer>

            <Divider separator="|" />

            <ActionContainer>
              <Button
                onClick={() =>
                  reviewerResponse(project, version, reviewer, 'rejected')
                }
              >
                reject
              </Button>
            </ActionContainer>
          </Actions>
        )}

        {reviewer.status === 'rejected' && 'rejected'}
      </Body>
    </Item>
  )
}

export default ReviewerItem
