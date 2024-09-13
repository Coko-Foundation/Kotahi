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

const DatePicker = props => {
  const { value, allowFutureDatesOnly } = props
  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)
  const dateObject = value ? new Date(value) : null

  return (
    <StyledDatePicker
      {...props}
      format="dd-MM-yyyy"
      minDate={allowFutureDatesOnly && minDate}
      value={dateObject}
    />
  )
}

export default DatePicker
