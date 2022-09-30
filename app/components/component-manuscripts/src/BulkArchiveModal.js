import React from 'react'
import {
  BulkArchiveModalContainer,
  BulkArchiveModalButtons,
  BulkArchiveModalButton,
} from './style'

const BulkArchiveModal = ({ confirmsBulkArchive, closeModal }) => {
  return (
    <BulkArchiveModalContainer>
      <p>Please confirm if you want to archive these selected articles</p>
      <br />
      <br />
      <br />
      <BulkArchiveModalButtons>
        <BulkArchiveModalButton onClick={confirmsBulkArchive} primary>
          Confirm
        </BulkArchiveModalButton>
        <BulkArchiveModalButton onClick={closeModal} secondary>
          Close
        </BulkArchiveModalButton>
      </BulkArchiveModalButtons>
    </BulkArchiveModalContainer>
  )
}

export default BulkArchiveModal
