import React from 'react'
import styled from 'styled-components'
import { Action, Button } from '@pubsweet/ui'
import { grid } from '@pubsweet/ui-toolkit'
import PropTypes from 'prop-types'
import config from 'config'
import ReviewerForm from './ReviewerForm'
import {
  Container,
  SectionRow,
  SectionContent,
  SectionHeader,
  Title,
  Heading,
  HeadingWithAction,
  StatusBadge,
} from '../../../../shared'

// TODO: Make this a proper shared component?
import { UserAvatar } from '../../../../component-avatar/src'

const ReviewersList = styled.div`
  display: grid;
  grid-gap: ${grid(2)};
  grid-template-columns: repeat(auto-fill, minmax(${grid(15)}, 1fr));
`

const Reviewer = styled.div``

const urlFrag = config.journal.metadata.toplevel_urlfragment

const Reviewers = ({
  journal,
  isValid,
  loadOptions,
  version,
  reviewers,
  reviewerUsers,
  manuscript,
  handleSubmit,
  removeReviewer,
  teams,
  history,
}) => (
  <Container>
    <HeadingWithAction>
      <Heading>Reviewers</Heading>
      <Button
        onClick={() =>
          history.push(`${urlFrag}/versions/${manuscript.id}/decision`)
        }
        primary
      >
        Back to control panel
      </Button>
    </HeadingWithAction>
    <SectionContent>
      <SectionHeader>
        <Title>Invite reviewers</Title>
      </SectionHeader>

      <SectionRow>
        <ReviewerForm
          handleSubmit={handleSubmit}
          isValid={isValid}
          journal={journal}
          loadOptions={loadOptions}
          reviewerUsers={reviewerUsers}
        />
      </SectionRow>
    </SectionContent>
    <SectionContent>
      <SectionHeader>
        <Title>Reviewer status</Title>
      </SectionHeader>
      <SectionRow>
        {reviewers && reviewers.length ? (
          <ReviewersList>
            {reviewers.map(reviewer => (
              <Reviewer key={reviewer.id}>
                <StatusBadge minimal status={reviewer.status} />
                <UserAvatar key={reviewer.id} user={reviewer.user} />
                {reviewer.user.defaultIdentity.name}
                <div>
                  <Action
                    onClick={() =>
                      removeReviewer({
                        variables: {
                          userId: reviewer.user.id,
                          manuscriptId: manuscript.id,
                        },
                      })
                    }
                  >
                    Delete
                  </Action>
                </div>
              </Reviewer>
            ))}
          </ReviewersList>
        ) : (
          <p>No reviewers have been invited yet</p>
        )}
      </SectionRow>
    </SectionContent>
  </Container>
)

Reviewers.propTypes = {
  journal: PropTypes.node.isRequired,
  isValid: PropTypes.node.isRequired,
  loadOptions: PropTypes.node.isRequired,
  version: PropTypes.node.isRequired,
  reviewers: PropTypes.node.isRequired,
  reviewerUsers: PropTypes.node.isRequired,
  manuscript: PropTypes.node.isRequired,
  handleSubmit: PropTypes.node.isRequired,
  removeReviewer: PropTypes.node.isRequired,
  teams: PropTypes.node.isRequired,
  history: PropTypes.node.isRequired,
}

export default Reviewers
