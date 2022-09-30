import React from 'react'
import {
  BulkActionModalContainer,
  BulkActionModalButtons,
  BulkActionModalButton,
} from './style'

const BulkArchiveModal = ({ confirmsBulkArchive, closeModal }) => {
  return (
    <BulkActionModalContainer>
      <p>Please confirm if you want to archive these selected articles</p>
      <br />
      <br />
      <br />
      <BulkActionModalButtons>
        <BulkActionModalButton onClick={confirmsBulkArchive} primary>
          Confirm
        </BulkActionModalButton>
        <BulkActionModalButton onClick={closeModal} secondary>
          Close
        </BulkActionModalButton>
      </BulkActionModalButtons>
    </BulkActionModalContainer>
  )
}

export default BulkArchiveModal
