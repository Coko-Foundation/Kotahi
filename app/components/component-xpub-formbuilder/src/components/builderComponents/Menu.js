import React, { useState } from 'react'
import { Select, TextField, ValidatedFieldFormik } from '@pubsweet/ui'
// import { compose, withState, withHandlers } from 'recompose'
import { Legend, Section } from '../styles'

const ValidationMenu = input => (
  // const validations = useState([])

  <>
    <Select
      {...input}
      // onChange={select => input.onChange(select.map(s => s.value))}
      // onChange={select => setValidations(select.map(s => s.value))}
    />

    {((Array.isArray(input.value) && input.value) || []).map(validation => {
      if (validation.value !== 'required') {
        return (
          <Section key={validation.value}>
            <Legend space>{validation.label} value</Legend>
            <ValidatedFieldFormik
              component={TextField}
              name={`validateValue.${validation.value}`}
            />
          </Section>
        )
      }
      return null
    })}
  </>
)

export default ValidationMenu
// export default compose(
//   withState('selectelement', 'changeSelect', undefined),
//   withHandlers({
//     onSelectElement: ({ changeSelect }) => value => changeSelect(() => value),
//   }),
// )(ValidationMenu)
