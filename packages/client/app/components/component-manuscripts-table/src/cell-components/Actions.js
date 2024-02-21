import React, { useState } from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
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
  const [confirmArchiveModalIsOpen, setConfirmArchiveModalIsOpen] =
    useState(false)

  const [publishErrorsModalIsOpen, setPublishErrorsModalIsOpen] =
    useState(false)

  const [publishingResponse, setPublishingResponse] = useState([])
  const { t } = useTranslation()
  return (
    <Container>
      {['preprint1', 'preprint2'].includes(config.instanceName) &&
        [
          articleStatuses.submitted,
          articleStatuses.evaluated,
          articleStatuses.new,
          articleStatuses.published,
        ].includes(manuscript.status) && (
          <LinkAction to={`${urlFrag}/versions/${manuscript.id}/evaluation`}>
            {t('manuscriptsTable.actions.Evaluation')}
          </LinkAction>
        )}
      {['journal', 'prc'].includes(config.instanceName) && (
        <LinkAction to={`${urlFrag}/versions/${manuscript.id}/decision`}>
          {t('manuscriptsTable.actions.Control')}
        </LinkAction>
      )}
      <LinkAction to={`${urlFrag}/versions/${manuscript.id}/manuscript`}>
        {t('manuscriptsTable.actions.View')}
      </LinkAction>
      <Action onClick={() => setConfirmArchiveModalIsOpen(true)}>
        {t('manuscriptsTable.actions.Archive')}
      </Action>
      <LinkAction to={`${urlFrag}/versions/${manuscript.id}/production`}>
        {t('manuscriptsTable.actions.Production')}
      </LinkAction>
      {['preprint1', 'preprint2'].includes(config.instanceName) &&
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
            {t('manuscriptsTable.actions.Publish')}
          </Action>
        )}
      <ConfirmationModal
        cancelButtonText={t('manuscriptsTable.actions.cancelArchiveButton')}
        closeModal={() => setConfirmArchiveModalIsOpen(false)}
        confirmationAction={() => archiveManuscript(manuscript.id)}
        confirmationButtonText={t(
          'manuscriptsTable.actions.confirmArchiveButton',
        )}
        isOpen={confirmArchiveModalIsOpen}
        message={t('manuscriptsTable.actions.confirmArchive')}
      />
      <Modal
        isOpen={publishErrorsModalIsOpen}
        onClose={() => setPublishErrorsModalIsOpen(false)}
        subtitle={t('manuscriptsTable.actions.Some targets failed to publish')}
        title={t('manuscriptsTable.actions.Publishing error')}
      >
        <PublishingResponse response={publishingResponse} />
      </Modal>
    </Container>
  )
}

export default Actions
