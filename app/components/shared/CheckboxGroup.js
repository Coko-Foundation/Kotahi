import React from 'react'
import { Checkbox } from './Checkbox'
/* import styled from 'styled-components' */
/* import theme from '../../theme' */

// eslint-disable-next-line import/prefer-default-export
export const CheckboxGroup = ({ options, ...props }) => {
  const handleChange = event => {
    const values = props.value ? Array.from(props.value) : []

    const { value } = event.target

    if (event.target.checked) {
      values.push(value)
    } else {
      values.splice(values.indexOf(value), 1)
    }

    props.onChange(values)
  }

  return (
    <>
      {options.map(option => (
        <Checkbox {...option} handleChange={handleChange} key={option.id} />
      ))}
    </>
  )
}
