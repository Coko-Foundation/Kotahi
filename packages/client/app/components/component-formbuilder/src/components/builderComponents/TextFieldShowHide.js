import React, { useEffect } from 'react'
import { useFormikContext } from 'formik'

import { TextField } from '../../../../pubsweet'

const TextFieldShowHideBuilder = ({ toggleShow, ...input }) => {
  const { setFieldValue, setFieldTouched, values } = useFormikContext()

  useEffect(() => {
    if (input.value === null && values.s3Url === null) {
      setFieldValue(input.name, '') // Set an initial value for the new field
      setFieldTouched(input.name, false) // Mark new field as untouched
    }
  }, [])

  return <TextField {...input} />
}

export default TextFieldShowHideBuilder
