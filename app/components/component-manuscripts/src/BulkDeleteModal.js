import React from 'react'
import {
  BulkActionModalContainer,
  BulkActionModalButtons,
  BulkActionModalButton,
} from './style'

const BulkDeleteModal = ({ confirmBulkDelete, closeModal }) => {
  return (
    <BulkActionModalContainer>
      <p>Please confirm you would like to delete selected articles</p>
      <br />
      <br />
      <br />
      <BulkActionModalButtons>
        <BulkActionModalButton onClick={confirmBulkDelete} primary>
          Confirm
        </BulkActionModalButton>
        <BulkActionModalButton onClick={closeModal} secondary>
          Close
        </BulkActionModalButton>
      </BulkActionModalButtons>
    </BulkActionModalContainer>
  )
}

export default BulkDeleteModal
