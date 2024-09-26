import React, { useEffect } from 'react'
import { useFormikContext } from 'formik'

import { TextField } from '../../../../pubsweet'

const TextFieldShowHideBuilder = ({ toggleShow, ...input }) => {
  const { setFieldValue, setFieldTouched } = useFormikContext()

  useEffect(() => {
    setFieldValue(input.name, '') // Set an initial value for the new field
    setFieldTouched(input.name, false) // Mark new field as untouched
  }, [])

  return <TextField {...input} />
}

export default TextFieldShowHideBuilder
