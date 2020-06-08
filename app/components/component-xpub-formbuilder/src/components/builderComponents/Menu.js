import React, { useState } from 'react'
import { Select, TextField, ValidatedFieldFormik } from '@pubsweet/ui'
import { compose, withState, withHandlers } from 'recompose'
import { Legend, Section } from '../styles'

const ValidationMenu = input => {
  const [validations, setValidations] = useState()

  return (
    <div>
      <Select
        {...input}
        onChange={value => setValidations(value)}
        selectElement={value => {
          input.onSelectElement(value)
        }}
      />
      {
        // the actual value is an object with:
        // [{"value":"minSize","label":"minSize"},{"value":"minChars","label":"minimum Characters"},{"value":"maxChars","label":"maximum Characters"}]"
      }
      {validations && validations !== 'required' && (
        <Section>
          <Legend space>Field Min / Max</Legend>
          <ValidatedFieldFormik
            component={TextField}
            name={`validateValue.${input.selectelement}`}
          />
        </Section>
      )}
    </div>
  )
}

export default compose(
  withState('selectelement', 'changeSelect', undefined),
  withHandlers({
    onSelectElement: ({ changeSelect }) => value => changeSelect(() => value),
  }),
)(ValidationMenu)
