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
  margin-left: 1em;
  margin-top: 20px;
`

const InvitationResult = ({ invitation }) => {
  const [open, setOpen] = useState(false)
  const toggleOpen = () => setOpen(!open)
  const { t } = useTranslation()
  const invitationStatus = invitation.status

  if (invitationStatus === 'UNANSWERED') {
    return null
  }

  const declinedResponse = invitation.declinedReason
  const { invitedPersonName } = invitation
  const { responseComment } = invitation
  const { responseDate } = invitation
  const dateToDisplay = convertTimestampToDateString(responseDate)
  const { user } = invitation

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
    <>
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
                    <Primary>
                      {user ? user?.username : invitedPersonName}
                    </Primary>
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
          {open && <ResponseComment>{responseComment}</ResponseComment>}
        </Root>
      </SectionRow>
    </>
  )
}

const InvitationResults = ({ invitations }) => {
  return (
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
