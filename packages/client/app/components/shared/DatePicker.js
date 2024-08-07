import styled from 'styled-components'
import UnstyledDatePicker from 'react-date-picker'
import { grid, th } from '@coko/client'

const DatePicker = styled(UnstyledDatePicker)`
  & > div.react-date-picker__wrapper {
    border-color: ${th('colorBorder')};
    border-radius: ${th('borderRadius')};
    height: ${grid(5)};
  }
`

export default DatePicker
