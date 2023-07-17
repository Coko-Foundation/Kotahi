import React from 'react'
import ReactModal from 'react-modal'
import styled from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'
import { LooseRowCentered } from '../../shared/Containers'
import ActionButton from '../../shared/ActionButton'

const styles = {
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    overflow: 'scroll',
  },

  content: {
    backgroundColor: '#303030',
    border: 'none',
    width: 'fit-content',
    height: 'fit-content',
    margin: '0 auto',
    padding: '0',
    overflow: 'none',
  },
}

const ModalContainer = styled.div`
  background-color: ${th('colorBackground')};
  border-radius: ${th('borderRadius')};
  padding: ${grid(2.5)} ${grid(3)};
  z-index: 10000;
`

const MessageString = styled.p`
  align-items: center;
  display: flex;
  justify-content: center;
  margin-bottom: ${grid(2.5)};
  width: 100%;
`

const Modal = ({ children, ...props }) => {
  return (
    <ReactModal style={styles} {...props}>
      {children}
    </ReactModal>
  )
}

/** A convenient modal that shows the supplied message and OK, Cancel buttons, and will call the supplied action and close functions as appropriate. */
export const ConfirmationModal = ({
  isOpen,
  message,
  confirmationAction,
  confirmationButtonText,
  closeModal,
}) => {
  return (
    <Modal isOpen={isOpen}>
      <ModalContainer>
        <MessageString>{message}</MessageString>
        <LooseRowCentered>
          <ActionButton
            onClick={e => {
              confirmationAction()
              closeModal()
            }}
            primary
          >
            {confirmationButtonText || 'OK'}
          </ActionButton>
          <ActionButton onClick={closeModal}>Cancel</ActionButton>
        </LooseRowCentered>
      </ModalContainer>
    </Modal>
  )
}

export default Modal
