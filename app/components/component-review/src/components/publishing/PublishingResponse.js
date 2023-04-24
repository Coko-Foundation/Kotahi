import React from 'react'
import Alert from './Alert'

const PublishingResponse = ({ response }) => {
  if (!response) return null

  return response.map(step => {
    if (step.succeeded) {
      return (
        <Alert key={step.stepLabel} type="success">
          Posted to {step.stepLabel}
        </Alert>
      )
    }

    return (
      <Alert detail={step.errorMessage} key={step.stepLabel} type="error">
        Error posting to {step.stepLabel}
      </Alert>
    )
  })
}

export default PublishingResponse
