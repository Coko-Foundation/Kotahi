import React from 'react'
import { useFormikContext, ErrorMessage } from 'formik'
import { useTranslation } from 'react-i18next'
import { MediumRow } from '../../../../shared'
import { Legend, ErrorMessageWrapper } from '../style'

import { TextField } from '../../../../pubsweet'

const FieldTitle = ({ name }) => {
  const { t } = useTranslation()

  return (
    <MediumRow>
      <Legend space>
        {t(
          `formBuilder.Field ${name}`,
          t('formBuilder.fallbackFieldLabel', { name }),
        )}
      </Legend>
      <ErrorMessageWrapper>
        <ErrorMessage name={name} />
      </ErrorMessageWrapper>
    </MediumRow>
  )
}

const TextFieldShowHideBuilder = ({ toggleShow, ...input }) => {
  const { values } = useFormikContext()
  return toggleShow(values) ? (
    <>
      <FieldTitle name={input.name} />
      <TextField {...input} />
    </>
  ) : null
}

export default TextFieldShowHideBuilder
