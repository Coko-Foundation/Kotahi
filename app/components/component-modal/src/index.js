import React from 'react'
import ReactModal from 'react-modal'
import styled from 'styled-components'
import { th, grid, darken } from '@pubsweet/ui-toolkit'
import { Button } from '@pubsweet/ui'

const styles = {
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  content: {
    backgroundColor: '#303030',
    border: 'none',
    width: 'fit-content',
    height: 'fit-content',
    margin: '0 auto',
    padding: '0',
  },
}

const ModalContainer = styled.div`
  background-color: ${th('colorBackground')};
  padding: ${grid(2.5)} ${grid(3)};
  z-index: 10000;
`

const CancelButton = styled(Button)`
  background-color: ${th('colorFurniture')};
  margin-left: 1em;
  padding: ${grid(1)};
  text-decoration: none;

  &:hover {
    background-color: ${darken('colorFurniture', 0.1)};
  }
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
  closeModal,
}) => {
  return (
    <Modal isOpen={isOpen}>
      <ModalContainer>
        <MessageString>{message}</MessageString>
        <Button
          onClick={e => {
            confirmationAction()
            closeModal()
          }}
          primary
        >
          Archive
        </Button>
        <CancelButton onClick={closeModal}>Cancel</CancelButton>
      </ModalContainer>
    </Modal>
  )
}

export default Modal
