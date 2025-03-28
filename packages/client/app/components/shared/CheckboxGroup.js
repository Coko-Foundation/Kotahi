import React from 'react'
import { Checkbox } from './Checkbox'
/* import styled from 'styled-components' */
/* import theme from '../../theme' */

// eslint-disable-next-line import/prefer-default-export
export const CheckboxGroup = ({
  options,
  value: values,
  'data-testid': dataTestid,
  ...props
}) => {
  const handleChange = event => {
    const { name } = event.target

    const newValues = Array.isArray(values)
      ? values.filter(v => v !== name)
      : []

    if (event.target.checked) newValues.push(name)
    props.onChange(newValues)
  }

  return (
    <div data-testid={dataTestid}>
      {options.map(option => (
        <Checkbox
          {...option}
          checked={values?.includes(option.value)}
          handleChange={handleChange}
          key={option.id}
        />
      ))}
    </div>
  )
}
