import React from 'react'
import {
  BulkActionModalContainer,
  BulkActionModalButtons,
  BulkActionModalButton,
} from './style'

const BulkArchiveModal = ({ confirmBulkArchive, closeModal }) => {
  return (
    <BulkActionModalContainer>
      <p>Please confirm you would like to archive selected manuscripts</p>
      <br />
      <br />
      <br />
      <BulkActionModalButtons>
        <BulkActionModalButton onClick={confirmBulkArchive} primary>
          Archive
        </BulkActionModalButton>
        <BulkActionModalButton onClick={closeModal} secondary>
          Cancel
        </BulkActionModalButton>
      </BulkActionModalButtons>
    </BulkActionModalContainer>
  )
}

export default BulkArchiveModal
