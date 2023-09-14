import React, { useState } from 'react'
import Modal from '../../../component-modal/src/Modal'
import { ActionButton, LooseRow } from '../../../shared'
import IsolatedMessageWithDetails from './IsolatedMessageWithDetails'
import { hasValue } from '../../../../shared/htmlUtils'

const EditDeleteMessageModal = ({ close, onConfirm, message, title }) => {
  const [updatedContent, setUpdatedContent] = useState(message.content)

  const handleSave = () => onConfirm(updatedContent)

  const saveIsDisabled =
    !hasValue(updatedContent) || updatedContent === message.content

  const onEnterPress = updatedMessage => {
    if (saveIsDisabled) close()
    else handleSave(updatedMessage)
  }

  return (
    <Modal
      isOpen
      onClose={close}
      rightActions={
        <LooseRow>
          <ActionButton disabled={saveIsDisabled} onClick={handleSave} primary>
            Save
          </ActionButton>
          <ActionButton onClick={close}>Cancel</ActionButton>
        </LooseRow>
      }
      title={title}
    >
      <IsolatedMessageWithDetails
        message={message}
        onChange={setUpdatedContent}
        onEnterPress={onEnterPress}
      />
    </Modal>
  )
}

const defaultProps = {
  readonly: false,
}

EditDeleteMessageModal.defaultProps = defaultProps

export default EditDeleteMessageModal
