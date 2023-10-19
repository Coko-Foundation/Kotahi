import React, { useState } from 'react'
import { Button } from '@pubsweet/ui'
import { Trans, useTranslation } from 'react-i18next'
import i18next from 'i18next'
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

import { languagesLabels } from '../../../../i18n/index'

const Publish = ({ manuscript, publishManuscript, dois }) => {
  // Hooks from the old world
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishResponse, setPublishResponse] = useState(null)
  const [publishingError, setPublishingError] = useState(null)

  const notAccepted = !['accepted', 'published'].includes(manuscript.status)
  const { t } = useTranslation()

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
    const curLang = languagesLabels.find(
      elem => elem.value === i18next.language,
    )

    return !!curLang && !!curLang.funcs?.formatDate
      ? curLang.funcs?.formatDate(date, true, false)
      : date
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

          {!manuscript.published && notAccepted && (
            <div>
              <p>{t('decisionPage.decisionTab.publishOnlyAccepted')}</p>
              {doiMessage}
            </div>
          )}
          {!manuscript.published && !notAccepted && (
            <div>
              <p>{t('decisionPage.decisionTab.publishingNewEntry')}</p>
              {doiMessage}
            </div>
          )}
          {publishResponse && <PublishingResponse response={publishResponse} />}
          {publishingError && <Alert type="error">{publishingError}</Alert>}
        </SectionActionInfo>
        <SectionAction>
          <Button
            disabled={notAccepted || isPublishing}
            onClick={() => {
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
            }}
            primary
          >
            {manuscript.published
              ? t('decisionPage.decisionTab.Republish')
              : t('decisionPage.decisionTab.Publish')}
          </Button>
        </SectionAction>
      </SectionRowGrid>
    </SectionContent>
  )
}

export default Publish
