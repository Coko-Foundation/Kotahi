import React, { useState } from 'react'
import { UserAction as Action } from '../style'
import { articleStatuses } from '../../../../globals'
import { ConfirmationModal } from '../../../component-modal/src'

const Actions = ({
  manuscript,
  deleteManuscript,
  isManuscriptBlockedFromPublishing,
  tryPublishManuscript,
  urlFrag,
}) => {
  const [confirmDeleteModalIsOpen, setConfirmDeleteModalIsOpen] = useState(
    false,
  )

  return (
    <>
      {['elife', 'ncrc'].includes(process.env.INSTANCE_NAME) &&
        [
          articleStatuses.submitted,
          articleStatuses.evaluated,
          articleStatuses.new,
          articleStatuses.published,
        ].includes(manuscript.status) && (
          <Action to={`${urlFrag}/versions/${manuscript.id}/evaluation`}>
            Evaluation
          </Action>
        )}
      {['aperture', 'colab'].includes(process.env.INSTANCE_NAME) && (
        <Action to={`${urlFrag}/versions/${manuscript.id}/decision`}>
          Control
        </Action>
      )}
      <Action to={`${urlFrag}/versions/${manuscript.id}/manuscript`}>
        View
      </Action>
      <Action onClick={() => setConfirmDeleteModalIsOpen(true)}>Delete</Action>
      <Action to={`${urlFrag}/versions/${manuscript.id}/production`}>
        Production
      </Action>
      {['elife', 'ncrc'].includes(process.env.INSTANCE_NAME) &&
        manuscript.status === articleStatuses.evaluated && (
          <Action
            isDisabled={isManuscriptBlockedFromPublishing(manuscript.id)}
            onClick={() => tryPublishManuscript(manuscript)}
          >
            Publish
          </Action>
        )}
      <ConfirmationModal
        closeModal={() => setConfirmDeleteModalIsOpen(false)}
        confirmationAction={() => deleteManuscript(manuscript.id)}
        isOpen={confirmDeleteModalIsOpen}
        message="Permanently delete this manuscript?"
      />
    </>
  )
}

export default Actions
