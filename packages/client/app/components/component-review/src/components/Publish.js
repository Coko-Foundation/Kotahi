import React, { useState, useContext } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import i18next from 'i18next'
import styled from 'styled-components'
import { grid } from '@coko/client'

import { Formik } from 'formik'

import { ConfigContext } from '../../../config/src'
import { RadioBox } from '../../../component-formbuilder/src/components/builderComponents'
import { Legend } from '../../../component-formbuilder/src/components/style'

import { Button, ValidatedFieldFormik } from '../../../pubsweet'
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

const PublishWrapper = styled.div`
  div {
    margin-bottom: ${grid(2)};
  }
`

const Publish = ({
  manuscript,
  publishManuscript,
  updateAda,
  dois,
  areVerdictOptionsComplete,
  unpublish,
}) => {
  // Hooks from the old world
  const config = useContext(ConfigContext)
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishResponse, setPublishResponse] = useState(null)
  const [publishAdaResponse, setPublishAdaResponse] = useState(null)
  const [publishingError, setPublishingError] = useState(null)
  const { t } = useTranslation()

  const notAccepted = !['accepted', 'published', 'unpublished'].includes(
    manuscript.status,
  )

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
        setPublishResponse({ steps: [{ unpublished: true }] })
      })
      .catch(error => {
        console.error(error)
        setPublishingError(error.message)
      })
  }

  const adaState = manuscript.submission?.adaState

  return (
    <PublishWrapper>
      <SectionContent>
        <SectionHeader>
          <Title>{t('decisionPage.decisionTab.Publishing')}</Title>
        </SectionHeader>

        <SectionRowGrid>
          <SectionActionInfo>
            {manuscript.published && manuscript.status !== 'unpublished' && (
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
            {publishResponse && (
              <PublishingResponse response={publishResponse} />
            )}
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
                {manuscript.published && manuscript.status !== 'unpublished'
                  ? t('decisionPage.decisionTab.Republish')
                  : t('decisionPage.decisionTab.Publish')}
              </PublishButton>
            </ActionButtonsWrapper>
          </SectionAction>
        </SectionRowGrid>
      </SectionContent>
      {config.publishing.ada?.enableAdaPublish && (
        <SectionContent>
          <SectionHeader>
            <Title>{t('decisionPage.decisionTab.PublishingAda')}</Title>
          </SectionHeader>
          <SectionRowGrid>
            <Formik
              initialValues={{ adaState: manuscript.submission?.adaState }}
              onSubmit={(values, { setSubmitting }) => {
                updateAda({
                  variables: { id: manuscript.id, adaState: values.adaState },
                })
                  .then((res, error) => {
                    setPublishAdaResponse(res.data.updateAda, error)
                    setSubmitting(false)
                  })
                  .catch(error => {
                    setSubmitting(false)
                    setPublishingError(error.message)
                  })
              }}
            >
              {({ values, setFieldValue, handleSubmit }) => (
                <form onSubmit={handleSubmit}>
                  <Legend>
                    {t('decisionPage.decisionTab.PublishingAdaState')}
                  </Legend>
                  <ValidatedFieldFormik
                    component={RadioBox}
                    name="adaState"
                    onChange={v => {
                      setFieldValue('adaState', v)
                    }}
                    options={[
                      {
                        value: 'draft',
                        label: t('decisionPage.decisionTab.Draft'),
                        disabled:
                          adaState === 'findable' || adaState === 'publish',
                      },
                      {
                        value: 'findable',
                        label: t('decisionPage.decisionTab.Findable'),
                        disabled: adaState === null || adaState === 'publish',
                      },
                      {
                        value: 'publish',
                        label: t('decisionPage.decisionTab.Publish'),
                        disabled: adaState === null || adaState === 'draft',
                      },
                    ]}
                    value={values.adaState}
                  />
                  <Button
                    disabled={
                      (notAccepted && areVerdictOptionsComplete) || isPublishing
                    }
                    onClick={handleSubmit}
                    primary
                  >
                    {t('decisionPage.decisionTab.UpdateAda')}
                  </Button>
                  {publishAdaResponse && (
                    <PublishingResponse response={publishAdaResponse} />
                  )}
                </form>
              )}
            </Formik>
          </SectionRowGrid>
        </SectionContent>
      )}
    </PublishWrapper>
  )
}

export default Publish
