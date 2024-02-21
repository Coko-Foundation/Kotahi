import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyledButton } from '../style'
import LabelDropdown from './LabelDropdown'

const LabelsOrSelectButton = ({
  values,
  manuscript,
  setReadyToEvaluateLabel,
  options,
  doUpdateManuscript,
}) => {
  const { t } = useTranslation()

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
      {t('manuscriptsPage.Select')}
    </StyledButton>
  )
}

export default LabelsOrSelectButton
