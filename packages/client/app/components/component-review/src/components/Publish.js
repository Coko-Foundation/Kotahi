import React, { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import i18next from 'i18next'
import styled from 'styled-components'
import { Button } from '../../../pubsweet'
import {
  Title,
  SectionHeader,
  SectionRowGrid,
  SectionActionInfo,
  SectionAction,
} from './style'

import { SectionContent } from '../../../shared'
import Alert from './publishing/Alert'
import PublishingResponse from './publishing/PublishingResponse'
import { getLanguages } from '../../../../i18n'
import { color } from '../../../../theme'
import { FlexRow } from '../../../../globals'

const ActionButtonsWrapper = styled(FlexRow)`
  gap: 8px;
`

const UnpublishButton = styled(Button)`
  background: #fff;
  color: ${color.error.base};
  cursor: pointer;
  outline: 1px solid ${color.error.base};

  &:hover,
  &:focus,
  &:active {
    background: ${color.error.base};
    color: #fff;
  }
`

const PublishButton = styled(Button)`
  cursor: pointer;
  outline: 1px solid ${color.brand1.base};
`

const Publish = ({
  manuscript,
  publishManuscript,
  dois,
  areVerdictOptionsComplete,
  unpublish,
}) => {
  // Hooks from the old world
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishResponse, setPublishResponse] = useState(null)
  const [publishingError, setPublishingError] = useState(null)
  const { t } = useTranslation()

  const notAccepted = !['accepted', 'published'].includes(manuscript.status)

  const doiMessage =
    dois !== null &&
    (dois.length > 0 ? (
      <p>
        {t('decisionPage.decisionTab.doisToBeRegistered', {
          dois: dois.join(', '),
        })}
      </p>
    ) : (
      <p>{t('decisionPage.decisionTab.noDoisToBeRegistered')}</p>
    ))

  const formatPublishedDate = date => {
    const curLang = getLanguages().find(elem => elem.value === i18next.language)

    return !!curLang && !!curLang.funcs?.formatDate
      ? curLang.funcs?.formatDate(date, true, false)
      : date
  }

  const handlePublish = () => {
    setIsPublishing(true)

    publishManuscript({ variables: { id: manuscript.id } })
      .then((res, error) => {
        setIsPublishing(false)
        setPublishResponse(res.data.publishManuscript, error)
      })
      .catch(error => {
        console.error(error)
        setIsPublishing(false)
        setPublishingError(error.message)
      })
  }

  const handleUnpublish = () => {
    unpublish(manuscript.id)
      .then(() => {
        setPublishResponse(null)
      })
      .catch(error => {
        console.error(error)
        setPublishingError(error.message)
      })
  }

  return (
    <SectionContent>
      <SectionHeader>
        <Title>{t('decisionPage.decisionTab.Publishing')}</Title>
      </SectionHeader>

      <SectionRowGrid>
        <SectionActionInfo>
          {manuscript.published && (
            <Trans
              i18nKey="decisionPage.decisionTab.publishedOn"
              shouldUnescape
            >
              {{ date: formatPublishedDate(manuscript.published) }}
            </Trans>
          )}

          {!manuscript.published &&
            notAccepted &&
            areVerdictOptionsComplete && (
              <div>
                <p>{t('decisionPage.decisionTab.publishOnlyAccepted')}</p>
                {doiMessage}
              </div>
            )}
          {!manuscript.published &&
            !(notAccepted && areVerdictOptionsComplete) && (
              <div>
                <p>{t('decisionPage.decisionTab.publishingNewEntry')}</p>
                {doiMessage}
              </div>
            )}
          {publishResponse && <PublishingResponse response={publishResponse} />}
          {publishingError && <Alert type="error">{publishingError}</Alert>}
        </SectionActionInfo>
        <SectionAction>
          <ActionButtonsWrapper>
            {manuscript.published && manuscript.status !== 'unpublished' && (
              <UnpublishButton onClick={handleUnpublish} primary>
                {t('decisionPage.decisionTab.Unpublish')}
              </UnpublishButton>
            )}
            <PublishButton
              disabled={
                (notAccepted && areVerdictOptionsComplete) || isPublishing
              }
              onClick={handlePublish}
              primary
            >
              {manuscript.published
                ? t('decisionPage.decisionTab.Republish')
                : t('decisionPage.decisionTab.Publish')}
            </PublishButton>
          </ActionButtonsWrapper>
        </SectionAction>
      </SectionRowGrid>
    </SectionContent>
  )
}

export default Publish
