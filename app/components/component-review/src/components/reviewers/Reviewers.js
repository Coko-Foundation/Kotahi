import React from 'react'
import styled from 'styled-components'
import { Send } from 'react-feather'
import { Action, Button, Checkbox } from '@pubsweet/ui'
import { grid, th } from '@pubsweet/ui-toolkit'
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
  Primary,
  Secondary,
} from '../../../../shared'

// TODO: Make this a proper shared component?
import { UserAvatar } from '../../../../component-avatar/src'

const ReviewersList = styled.div`
  display: flex;
  gap: ${grid(4)};
  grid-template-columns: repeat(auto-fill, minmax(${grid(20)}, 1fr));
`

const SystemInvitedReviewers = styled.div`
  display: flex;
`

const EmailInvitedReviewers = styled.div`
  display: flex;
  margin-left: 16px;
`

const ReviewersWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
`

const SendIcon = styled(Send)`
  height: 25px;
  margin-bottom: -8px;
  margin-left: 5px;
  stroke: ${props =>
    props.invitationStatus === 'rejected'
      ? th('colorError')
      : th('colorPrimary')};
  width: 15px;
`

const Reviewer = styled.div``

const urlFrag = config.journal.metadata.toplevel_urlfragment

const Reviewers = ({
  isValid,
  reviewers,
  emailInvitedReviewers,
  reviewerUsers,
  manuscript,
  handleSubmit,
  removeReviewer,
  history,
  updateTeamMember,
  updateSharedStatusForInvitedReviewer,
  refetchManuscriptData,
}) => {
  const toggleReviewerSharedStatus = async (id, delta) => {
    await updateTeamMember({
      variables: {
        id,
        input: JSON.stringify(delta),
      },
    })
    refetchManuscriptData()
  }

  const toggleEmailInvitedReviewerSharedStatus = async (
    invitationId,
    isShared,
  ) => {
    await updateSharedStatusForInvitedReviewer({
      variables: {
        invitationId,
        isShared,
      },
    })
    refetchManuscriptData()
  }

  return (
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
            reviewerUsers={reviewerUsers}
          />
        </SectionRow>
      </SectionContent>
      <SectionContent>
        <SectionHeader>
          <Title>Reviewer status</Title>
        </SectionHeader>
        <SectionRow>
          {(reviewers || emailInvitedReviewers) &&
          (reviewers?.length || emailInvitedReviewers?.length) ? (
            <ReviewersWrapper>
              {(reviewers?.length || null) && (
                <SystemInvitedReviewers>
                  <ReviewersList>
                    {reviewers
                      .slice()
                      .sort((reviewOne, reviewTwo) => {
                        // Get the username of reviewer and convert to uppercase
                        const usernameOne = reviewOne.user.username.toUpperCase()
                        const usernameTwo = reviewTwo.user.username.toUpperCase()

                        // Sort by username
                        if (usernameOne < usernameTwo) return -1
                        if (usernameOne > usernameTwo) return 1

                        // If the username don't match then sort by reviewId
                        if (reviewOne.id < reviewTwo.id) return -1
                        if (reviewOne.id > reviewTwo.id) return 1

                        return 0
                      })
                      .map(reviewer => (
                        <Reviewer key={reviewer.id}>
                          <StatusBadge minimal status={reviewer.status} />
                          <UserAvatar key={reviewer.id} user={reviewer.user} />
                          <Primary>{reviewer.user.username}</Primary>
                          <Secondary>
                            {reviewer.user.defaultIdentity.identifier}
                          </Secondary>
                          {config.review.shared === 'true' && (
                            <Checkbox
                              checked={reviewer.isShared}
                              label="Shared"
                              name={`checkbox-shared-reviewer-${reviewer.id}`}
                              onChange={() =>
                                toggleReviewerSharedStatus(reviewer.id, {
                                  isShared: !reviewer.isShared,
                                })
                              }
                            />
                          )}
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
                </SystemInvitedReviewers>
              )}
              {(emailInvitedReviewers?.length || null) && (
                <EmailInvitedReviewers>
                  <ReviewersList>
                    {emailInvitedReviewers.map(invitation => (
                      <Reviewer key={invitation.id}>
                        <StatusBadge
                          minimal
                          status={invitation.status.toLowerCase()}
                        />
                        <SendIcon
                          invitationStatus={invitation.status.toLowerCase()}
                        />
                        <UserAvatar />
                        <Primary>{invitation.invitedPersonName}</Primary>
                        {config.review.shared === 'true' && (
                          <Checkbox
                            checked={invitation.isShared}
                            label="Shared"
                            name={`checkbox-shared-reviewer-${invitation.id}`}
                            onChange={() =>
                              toggleEmailInvitedReviewerSharedStatus(
                                invitation.id,
                                !invitation.isShared,
                              )
                            }
                          />
                        )}
                      </Reviewer>
                    ))}
                  </ReviewersList>
                </EmailInvitedReviewers>
              )}
            </ReviewersWrapper>
          ) : (
            <p>No reviewers have been invited yet</p>
          )}
        </SectionRow>
      </SectionContent>
    </Container>
  )
}

Reviewers.propTypes = {
  isValid: PropTypes.bool.isRequired,
  reviewers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      user: PropTypes.shape({
        id: PropTypes.string.isRequired,
        username: PropTypes.string.isRequired,
        defaultIdentity: PropTypes.shape({
          identifier: PropTypes.string.isRequired,
        }),
      }).isRequired,
    }).isRequired,
  ).isRequired,
  reviewerUsers: PropTypes.arrayOf(PropTypes.shape({}).isRequired).isRequired,
  manuscript: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  removeReviewer: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
}

export default Reviewers
