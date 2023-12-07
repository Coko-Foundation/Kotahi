import React from 'react'
import { StyledButton } from '../style'
import LabelDropdown from './LabelDropdown'

const LabelsOrSelectButton = ({
  values,
  manuscript,
  setReadyToEvaluateLabel,
  options,
  doUpdateManuscript,
}) => {
  if (values?.length)
    return (
      <LabelDropdown
        doUpdateManuscript={doUpdateManuscript}
        manuscript={manuscript}
        options={options}
        values={values}
      />
    )

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
