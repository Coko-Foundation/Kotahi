import React, { useState } from 'react'
import styled from 'styled-components'
import { Action, LinkAction } from '../../../shared'
import { articleStatuses } from '../../../../globals'
import { ConfirmationModal } from '../../../component-modal/src/ConfirmationModal'
import Modal from '../../../component-modal/src/Modal'
import PublishingResponse from '../../../component-review/src/components/publishing/PublishingResponse'

const Container = styled.div`
  display: flex;
  flex-direction: column;
`

const Actions = ({
  config,
  manuscript,
  archiveManuscript,
  tryPublishManuscript,
  urlFrag,
}) => {
  const [confirmArchiveModalIsOpen, setConfirmArchiveModalIsOpen] = useState(
    false,
  )

  const [publishErrorsModalIsOpen, setPublishErrorsModalIsOpen] = useState(
    false,
  )

  const [publishingResponse, setPublishingResponse] = useState([])

  return (
    <Container>
      {['elife', 'ncrc'].includes(config.instanceName) &&
        [
          articleStatuses.submitted,
          articleStatuses.evaluated,
          articleStatuses.new,
          articleStatuses.published,
        ].includes(manuscript.status) && (
          <LinkAction to={`${urlFrag}/versions/${manuscript.id}/evaluation`}>
            Evaluation
          </LinkAction>
        )}
      {['aperture', 'colab'].includes(config.instanceName) && (
        <LinkAction to={`${urlFrag}/versions/${manuscript.id}/decision`}>
          Control
        </LinkAction>
      )}
      <LinkAction to={`${urlFrag}/versions/${manuscript.id}/manuscript`}>
        View
      </LinkAction>
      <Action onClick={() => setConfirmArchiveModalIsOpen(true)}>
        Archive
      </Action>
      <LinkAction to={`${urlFrag}/versions/${manuscript.id}/production`}>
        Production
      </LinkAction>
      {['elife', 'ncrc'].includes(config.instanceName) &&
        manuscript.status === articleStatuses.evaluated && (
          <Action
            onActionCompleted={result => {
              if (result.steps.some(step => !step.succeeded)) {
                setPublishingResponse(result)
                setPublishErrorsModalIsOpen(true)
                return 'failure'
              }

              return 'success'
            }}
            onClick={async () => tryPublishManuscript(manuscript)}
          >
            Publish
          </Action>
        )}
      <ConfirmationModal
        closeModal={() => setConfirmArchiveModalIsOpen(false)}
        confirmationAction={() => archiveManuscript(manuscript.id)}
        confirmationButtonText="Archive"
        isOpen={confirmArchiveModalIsOpen}
        message="Please confirm you would like to archive this manuscript"
      />
      <Modal
        isOpen={publishErrorsModalIsOpen}
        onClose={() => setPublishErrorsModalIsOpen(false)}
        subtitle="Some targets failed to publish."
        title="Publishing error"
      >
        <PublishingResponse response={publishingResponse} />
      </Modal>
    </Container>
  )
}

export default Actions
