import React from 'react'
import { Menu, TextField, ValidatedFieldFormik } from '@pubsweet/ui'
import { compose, withState, withHandlers } from 'recompose'
import { Legend, Section } from '../styles'

const ValidationMenu = input => (
  <div>
    <Menu
      {...input}
      selectElement={value => {
        input.onSelectElement(value)
      }}
    />
    {input.selectelement && input.selectelement !== 'required' && (
      <Section>
        <Legend space>FIeld Min / Max</Legend>
        <ValidatedFieldFormik
          component={TextField}
          name={`validateValue.${input.selectelement}`}
        />
      </Section>
    )}
  </div>
)

export default compose(
  withState('selectelement', 'changeSelect', undefined),
  withHandlers({
    onSelectElement: ({ changeSelect }) => value => changeSelect(() => value),
  }),
)(ValidationMenu)
