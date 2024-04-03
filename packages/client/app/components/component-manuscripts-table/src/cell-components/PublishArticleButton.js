import React, { useState } from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { ActionButton } from '../../../shared'
import { articleStatuses } from '../../../../globals'
import Modal from '../../../component-modal/src/Modal'
import PublishingResponse from '../../../component-review/src/components/publishing/PublishingResponse'

const Container = styled.div``

const PublishArticleButton = ({
  config,
  manuscript,
  tryPublishManuscript,
  urlFrag,
}) => {
  const [publishStatus, setPublishStatus] = useState('')
  const [publishingResponse, setPublishingResponse] = useState([])

  const [publishErrorsModalIsOpen, setPublishErrorsModalIsOpen] =
    useState(false)

  const { t } = useTranslation()

  const allowPublish = [
    articleStatuses.evaluated,
    articleStatuses.submitted,
    articleStatuses.published,
  ].includes(manuscript.status)

  const submitButtonShouldRepublish =
    manuscript.status === articleStatuses.published

  const handlePublish = async () => {
    setPublishStatus('pending')

    const result = await tryPublishManuscript(manuscript)

    if (result.steps.some(step => !step.succeeded)) {
      setPublishingResponse(result)
      setPublishErrorsModalIsOpen(true)
      setPublishStatus('failure')
    } else {
      setPublishStatus('success')
    }
  }

  return (
    <Container>
      {/* {allowPublish && ( */}
      <ActionButton
        disabled={!allowPublish}
        onClick={handlePublish}
        primary
        status={publishStatus}
      >
        {t(
          `manuscriptsTable.actions.${
            submitButtonShouldRepublish ? 'Republish' : 'Publish'
          }`,
        )}
      </ActionButton>
      {/*    )} */}
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

export default PublishArticleButton
