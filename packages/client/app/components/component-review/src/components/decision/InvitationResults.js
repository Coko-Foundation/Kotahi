import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import { Button } from '@pubsweet/ui'
import { th } from '@pubsweet/ui-toolkit'
import { useTranslation } from 'react-i18next'
import { SectionRow } from '../style'
import { UserCombo, Primary, Secondary, UserInfo } from '../../../../shared'
import { UserAvatar } from '../../../../component-avatar/src'
import { convertTimestampToDateString } from '../../../../../shared/dateUtils'
import {
  Controls,
  Name,
  ToggleReview,
  ReviewHeadingRoot,
} from './DecisionReview'

const ToggleInvitation = ({ open, toggle }) => (
  <Button onClick={toggle} plain>
    {open ? 'Hide' : 'Show'}
  </Button>
)

const Bullet = styled.span`
  background-color: black;
  border-radius: 100%;
  display: inline-block;
  height: 10px;
  margin-right: 10px;
  ${props =>
    props.status === 'REJECTED'
      ? css`
          background-color: red;
        `
      : css`
          background-color: green;
        `};

  width: 10px;
`

export const Ordinal = styled.span`
  ${props =>
    props.status === 'REJECTED'
      ? css`
          color: red;
        `
      : css`
          color: green;
        `};
  width: 150px;
`

const Root = styled.div`
  margin-bottom: calc(${th('gridUnit')} * 3);
`

const ResponseComment = styled.div`
  padding: 5px;
`

const ToggleableArea = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 10px;
`

const SectionHeader = styled.h4`
  font-weight: bold;
  margin-bottom: 8px;
  margin-top: 10px;
`

const SuggestedReviewerContainer = styled.div`
  display: flex;
  margin-bottom: 8px;
`

const SuggestedReviewerFieldLabel = styled.span`
  font-weight: bold;
  margin-right: 5px;
`

const SuggestedReviewerFieldValue = styled.span`
  margin-right: 8px;
`

const SuggestedReviewerInnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

const SuggestedReviewerInnerRow = styled.div`
  display: flex;
  width: 100%;
`

const InvitationResult = ({ invitation }) => {
  const [open, setOpen] = useState(false)
  const toggleOpen = () => setOpen(!open)
  const { t } = useTranslation()

  const {
    status: invitationStatus,
    invitedPersonName,
    responseComment,
    responseDate,
    suggestedReviewers,
    user,
    declinedReason: declinedResponse,
  } = invitation

  if (invitationStatus === 'UNANSWERED') {
    return null
  }

  const dateToDisplay = convertTimestampToDateString(responseDate)

  let ordinalString = ''
  let invitationType = ''

  if (invitation?.invitedPersonType === 'AUTHOR') {
    invitationType = t('invitationResults.author')
  } else {
    invitationType = t('invitationResults.reviewer')
  }

  if (
    invitationStatus === 'REJECTED' &&
    declinedResponse === 'DO_NOT_CONTACT'
  ) {
    ordinalString = t('invitationResults.declinedAndOptedOut', {
      invitationType,
    })
  } else if (invitationStatus === 'REJECTED') {
    ordinalString = t('invitationResults.declined', {
      invitationType,
    })
  } else if (invitationStatus === 'ACCEPTED') {
    ordinalString = t('invitationResults.accepted', {
      invitationType,
    })
  }

  return (
    <SectionRow>
      <Root>
        <ReviewHeadingRoot>
          <Bullet status={invitation.status} />
          <Ordinal status={invitation.status}>{ordinalString}</Ordinal>
          &nbsp;
          <Name>
            <UserCombo>
              <UserAvatar user={user} />
              <UserInfo>
                <>
                  <Primary>{user ? user?.username : invitedPersonName}</Primary>
                  <Secondary>{dateToDisplay}</Secondary>
                </>
              </UserInfo>
            </UserCombo>
          </Name>
          {responseComment && (
            <Controls>
              <ToggleReview open={open} t={t} toggle={toggleOpen} />
            </Controls>
          )}
        </ReviewHeadingRoot>

        {open && (
          <ToggleableArea>
            <SectionHeader>Response Comments</SectionHeader>
            <ResponseComment>{responseComment}</ResponseComment>
            {suggestedReviewers.length ? (
              <>
                <SectionHeader>Suggested Reviewers</SectionHeader>
                {suggestedReviewers.map((suggestedReviewer, i) => (
                  /* eslint-disable react/no-array-index-key */
                  <SuggestedReviewerContainer key={`suggestedReviewer-${i}`}>
                    <SuggestedReviewerInnerContainer>
                      <SuggestedReviewerInnerRow>
                        <SuggestedReviewerFieldLabel>
                          Full Name:
                        </SuggestedReviewerFieldLabel>
                        <SuggestedReviewerFieldValue>
                          {`${suggestedReviewer.firstName} ${suggestedReviewer.lastName}`}
                        </SuggestedReviewerFieldValue>
                        <SuggestedReviewerFieldLabel>
                          Email:
                        </SuggestedReviewerFieldLabel>
                        <SuggestedReviewerFieldValue>
                          {suggestedReviewer.email}
                        </SuggestedReviewerFieldValue>
                      </SuggestedReviewerInnerRow>
                      <SuggestedReviewerInnerRow>
                        <SuggestedReviewerFieldLabel>
                          Affiliation:
                        </SuggestedReviewerFieldLabel>
                        <SuggestedReviewerFieldValue>
                          {suggestedReviewer.affiliation}
                        </SuggestedReviewerFieldValue>
                      </SuggestedReviewerInnerRow>
                    </SuggestedReviewerInnerContainer>
                  </SuggestedReviewerContainer>
                ))}
              </>
            ) : null}
          </ToggleableArea>
        )}
      </Root>
    </SectionRow>
  )
}

const InvitationResults = ({ invitations }) => {
  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {invitations &&
        invitations.map(invitation => {
          return (
            <InvitationResult invitation={invitation} key={invitation.id} />
          )
        })}
    </>
  )
}

ToggleInvitation.propTypes = {
  open: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
}

Bullet.propTypes = {
  // eslint-disable-next-line
  journal: PropTypes.object,
  recommendation: PropTypes.string.isRequired,
}

export default InvitationResults
