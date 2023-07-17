import React from 'react'
import styled from 'styled-components'
import { convertTimestampToDateString } from '../../../../shared/dateUtils'
import { UserAvatar } from '../../../component-avatar/src'
import Modal from '../../../component-modal/src/Modal'
import { ConfigurableStatus } from '../../../shared'
import { color } from '../../../../theme'

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const ResponseCommentRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const ModalBodyRow = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: 10px;
`

const StyledH4 = styled.h4`
  font-weight: 600;
`

const DeclinedBadge = styled(ConfigurableStatus)`
  background: #c23d20;
`

const TextChange = styled.div`
  color: ${props => (props.gray ? color.brand2.base : color.text)};
`

const InviteDeclineModal = ({ invitation, isOpen, onClose }) => {
  const name = invitation.invitedPersonName ?? invitation.user.username

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      subtitle={`Declined: ${convertTimestampToDateString(
        invitation.responseDate ?? invitation.updated,
      )}`}
      title={`${name}'s Invitation Decline`}
    >
      <ModalBody style={{ width: '600px' }}>
        <ModalBodyRow style={{ gap: '0px' }}>
          <UserAvatar
            size={56}
            style={{ marginRight: '15px' }}
            user={invitation.user}
          />
          <StyledH4 style={{ marginRight: '5px' }}>Reviewer: </StyledH4>
          <p>{name}</p>
        </ModalBodyRow>
        <ModalBodyRow>
          <StyledH4>Status</StyledH4>
          <DeclinedBadge lightText>Declined</DeclinedBadge>
          {invitation.declinedReason === 'DO_NOT_CONTACT' && (
            <DeclinedBadge lightText>Opted Out</DeclinedBadge>
          )}
        </ModalBodyRow>
        <ResponseCommentRow>
          <StyledH4>Declined Reason</StyledH4>
          <TextChange gray={!invitation.responseComment}>
            {invitation.responseComment || 'No reason provided.'}
          </TextChange>
        </ResponseCommentRow>
      </ModalBody>
    </Modal>
  )
}

export default InviteDeclineModal
