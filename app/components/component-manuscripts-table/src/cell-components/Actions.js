import React, { useState } from 'react'
import styled from 'styled-components'
import { UserAction as Action } from '../style'
import { articleStatuses } from '../../../../globals'
import { ConfirmationModal } from '../../../component-modal/src/ConfirmationModal'

const Container = styled.div`
  display: flex;
  flex-direction: column;
`

const Actions = ({
  config,
  manuscript,
  archiveManuscript,
  isManuscriptBlockedFromPublishing,
  tryPublishManuscript,
  urlFrag,
}) => {
  const [confirmArchiveModalIsOpen, setConfirmArchiveModalIsOpen] = useState(
    false,
  )

  return (
    <Container>
      {['elife', 'ncrc'].includes(config.instanceName) &&
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
      {['aperture', 'colab'].includes(config.instanceName) && (
        <Action to={`${urlFrag}/versions/${manuscript.id}/decision`}>
          Control
        </Action>
      )}
      <Action to={`${urlFrag}/versions/${manuscript.id}/manuscript`}>
        View
      </Action>
      <Action onClick={() => setConfirmArchiveModalIsOpen(true)}>
        Archive
      </Action>
      <Action to={`${urlFrag}/versions/${manuscript.id}/production`}>
        Production
      </Action>
      {['elife', 'ncrc'].includes(config.instanceName) &&
        manuscript.status === articleStatuses.evaluated && (
          <Action
            isDisabled={isManuscriptBlockedFromPublishing(manuscript.id)}
            onClick={() => tryPublishManuscript(manuscript)}
          >
            Publish
          </Action>
        )}
      <ConfirmationModal
        closeModal={() => setConfirmArchiveModalIsOpen(false)}
        confirmationAction={() => archiveManuscript(manuscript.id)}
        isOpen={confirmArchiveModalIsOpen}
        message="Please confirm you would like to archive this manuscript"
      />
    </Container>
  )
}

export default Actions
