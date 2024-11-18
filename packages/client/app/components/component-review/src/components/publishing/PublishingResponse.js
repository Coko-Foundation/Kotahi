import React from 'react'
import { useTranslation } from 'react-i18next'
import Alert from './Alert'

const PublishingResponse = ({ response }) => {
  const { t } = useTranslation()
  if (!response?.steps) return null

  return response.steps.map(step => {
    const { stepLabel } = step

    if (step.unpublished) {
      return (
        <Alert key={stepLabel} type="success">
          {t('decisionPage.decisionTab.unpublishResponse')}
        </Alert>
      )
    }

    if (step.succeeded) {
      return (
        <Alert key={stepLabel} type="success">
          {t('decisionPage.decisionTab.postedTo', { stepLabel })}
        </Alert>
      )
    }

    return (
      <Alert detail={step.errorMessage} key={stepLabel} type="error">
        {t('decisionPage.decisionTab.errorPosting', { stepLabel })}
      </Alert>
    )
  })
}

export default PublishingResponse
