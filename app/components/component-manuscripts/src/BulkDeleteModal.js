import React from 'react'
import {
  BulkDeleteModalContainer,
  BulkDeleteModalButtons,
  BulkDeleteModalButton,
} from './style'

const BulkDeleteModal = ({ confirmBulkDelete, closeModal }) => {
  return (
    <BulkDeleteModalContainer>
      <p>Please confirm if you want to archive these selected articles</p>
      <br />
      <br />
      <br />
      <BulkDeleteModalButtons>
        <BulkDeleteModalButton onClick={confirmBulkDelete} primary>
          Confirm
        </BulkDeleteModalButton>
        <BulkDeleteModalButton onClick={closeModal} secondary>
          Close
        </BulkDeleteModalButton>
      </BulkDeleteModalButtons>
    </BulkDeleteModalContainer>
  )
}

export default BulkDeleteModal
