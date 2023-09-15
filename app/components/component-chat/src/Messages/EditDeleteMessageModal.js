import React, { useState } from 'react'
import styled from 'styled-components'
import Modal from '../../../component-modal/src/Modal'
import { ActionButton, LooseRow } from '../../../shared'
import IsolatedMessageWithDetails from './IsolatedMessageWithDetails'
import { hasValue } from '../../../../shared/htmlUtils'

const ExtendedModal = styled(Modal)`
  /* overriding overflow and z-index to ensure editor controls with dropdowns show up nicely */

  /* modal content */
  /* stylelint-disable-next-line declaration-no-important */
  overflow: visible !important;

  /* modal container */
  > div {
    /* stylelint-disable-next-line declaration-no-important */
    overflow: visible !important;
    z-index: 10001;
  }
`

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
    <ExtendedModal
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
    </ExtendedModal>
  )
}

const defaultProps = {
  readonly: false,
}

EditDeleteMessageModal.defaultProps = defaultProps

export default EditDeleteMessageModal
