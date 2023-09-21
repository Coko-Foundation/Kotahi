import { CheckboxGroup } from '@pubsweet/ui'
import { grid, th } from '@pubsweet/ui-toolkit'
import React, { useState, useContext } from 'react'
import styled from 'styled-components'
import { UserAvatar } from '../../../../component-avatar/src'
import Modal from '../../../../component-modal/src/Modal'
import { ConfigContext } from '../../../../config/src'
import {
  ActionButton,
  LooseColumn,
  MediumRow,
  Primary,
  Secondary,
} from '../../../../shared'
import {
  sendEmail,
  sendEmailChannelMessage,
} from '../emailNotifications/emailUtils'

const ModalContainer = styled(LooseColumn)`
  background-color: ${th('colorBackground')};
  padding: ${grid(2.5)} ${grid(3)};
  z-index: 10000;
`

const UserId = styled.div`
  display: flex;
  flex-flow: column nowrap;
`

const StyledInfo = styled.div`
  display: grid;
  gap: 10px;
  grid-template-columns: min-content max-content;
`

const StyledCheckbox = styled.div`
  grid-column: 2 / 3;
`

const InviteReviewerModal = ({
  open,
  onClose,
  userId,
  reviewerUsers,
  addReviewer,
  manuscript,
  selectedEmail,
  sendChannelMessage,
  sendNotifyEmail,
  currentUser,
  updateSharedStatusForInvitedReviewer,
  updateTeamMember,
  reviewerInvitationEmailTemplate,
  emailTemplates,
}) => {
  const config = useContext(ConfigContext)
  const [condition, setCondition] = useState([])
  const [inviteStatus, setInviteStatus] = useState(null)
  const identity = reviewerUsers.find(user => user.id === userId)

  const toggleSharedStatus = async (isInvitation, reviewerTeamMember) => {
    if (isInvitation) {
      await updateSharedStatusForInvitedReviewer({
        variables: {
          invitationId: reviewerTeamMember.id,
          isShared: !reviewerTeamMember.isShared,
        },
      })
    } else {
      await updateTeamMember({
        variables: {
          id: reviewerTeamMember.id,
          input: JSON.stringify({ isShared: !reviewerTeamMember.isShared }),
        },
      })
    }
  }

  const options = []
  if (config.controlPanel?.sharedReview)
    options.push({ value: 'shared', label: 'Shared' })
  options.push({ value: 'email-notification', label: 'Email Notification' })

  return (
    <Modal isOpen={open} onClose={onClose} title="Invite Reviewer">
      <ModalContainer>
        <StyledInfo>
          <UserAvatar isClickable={false} size={48} user={identity?.username} />
          <UserId>
            <Primary>{identity?.username}</Primary>
            <Secondary>{identity?.defaultIdentity?.identifier}</Secondary>
          </UserId>
          <StyledCheckbox>
            <CheckboxGroup
              onChange={value => setCondition({ value })}
              options={options}
              value={condition.value}
            />
          </StyledCheckbox>
        </StyledInfo>
        <MediumRow>
          <ActionButton onClick={onClose}>Cancel</ActionButton>
          &nbsp;
          <ActionButton
            dataTestid="submit-modal"
            onClick={async () => {
              const isInvitation = condition?.value?.includes(
                'email-notification',
              )

              let teamMember

              if (isInvitation) {
                setInviteStatus('pending')

                const response = await sendEmail(
                  manuscript,
                  false,
                  currentUser,
                  sendNotifyEmail,
                  reviewerInvitationEmailTemplate,
                  identity.email,
                  identity.email,
                  identity.username,
                  false,
                  config.groupId,
                )

                if (!response || !response?.emailStatus) {
                  setInviteStatus('failure')
                  return
                }

                if (response.input) {
                  sendEmailChannelMessage(
                    sendChannelMessage,
                    currentUser,
                    response.input,
                    reviewerUsers.map(reviewer => ({
                      userName: reviewer.username,
                      value: reviewer.email,
                    })),
                    emailTemplates,
                  )
                }

                teamMember = response.invitation
              } else {
                const { data } = await addReviewer({
                  variables: {
                    userId: identity.id,
                    manuscriptId: manuscript.id,
                  },
                })

                teamMember = data.addReviewer.members.find(
                  member => member.user.id === identity.id,
                )
              }

              if (condition?.value?.includes('shared')) {
                toggleSharedStatus(isInvitation, {
                  id: teamMember.id,
                  isShared: false,
                })
              }

              setInviteStatus('success')
              onClose()
              setInviteStatus(null)
            }}
            primary
            status={inviteStatus}
          >
            Invite
          </ActionButton>
        </MediumRow>
      </ModalContainer>
    </Modal>
  )
}

export default InviteReviewerModal
