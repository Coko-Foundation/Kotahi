import React from 'react'
import DefaultField from './DefaultField'
import { StyledButton } from '../style'

const LabelsOrSelectButton = ({
  values,
  applyFilter,
  manuscript,
  setReadyToEvaluateLabel,
}) => {
  if (values?.length)
    return <DefaultField applyFilter={applyFilter} values={values} />

  return (
    <StyledButton
      onClick={() => setReadyToEvaluateLabel(manuscript.id)}
      primary
    >
      Select
    </StyledButton>
  )
}

export default LabelsOrSelectButton
