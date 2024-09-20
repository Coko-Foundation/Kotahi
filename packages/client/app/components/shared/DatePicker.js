import React from 'react'
import styled from 'styled-components'
import UnstyledDatePicker from 'react-date-picker'
import { grid, th } from '@coko/client'

const StyledDatePicker = styled(UnstyledDatePicker)`
  & > div.react-date-picker__wrapper {
    border-color: ${th('colorBorder')};
    border-radius: ${th('borderRadius')};
    height: ${grid(5)};
  }
`

const DatePicker = ({ value, allowFutureDatesOnly, onChange, ...rest }) => {
  // Calculate minDate
  const minDate = allowFutureDatesOnly
    ? new Date(Date.now() + 86400000)
    : undefined // Add 1 day in milliseconds

  // If value exists, convert it into a Date object, otherwise keep it undefined
  const dateObject = value ? new Date(value) : undefined

  return (
    <StyledDatePicker
      {...rest}
      format="yyyy-MM-dd"
      minDate={minDate}
      onChange={val => onChange(val ?? '')}
      value={dateObject}
    />
  )
}

export default DatePicker
