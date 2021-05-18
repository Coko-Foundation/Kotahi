import React from 'react'
import styled, { css } from 'styled-components'
import PropTypes from 'prop-types'
import { th, lighten } from '@pubsweet/ui-toolkit'

const InlineBlock = styled.div`
  display: inline-block;
`

const Input = styled.input`
  border: 1px solid
    ${props => (props.isInvalid ? th('colorError') : th('colorBorder'))};
  ${props =>
    props.isInvalid &&
    css`
      background-color: ${lighten('colorError', 0.4)};
    `}
`

const getDateUtcString = date => {
  return new Date(date).toISOString().slice(0, 10)
}

const getMillisecondsFromUtcString = utcString => {
  const date = new Date(utcString)
  return date.getTime()
}

const DateRangePicker = ({ endDate, max, setDateRange, startDate }) => {
  const endIsInvalid = endDate > max
  const startIsInvalid = startDate > max || startDate > endDate
  return (
    <InlineBlock>
      <Input
        isInvalid={startIsInvalid}
        max={getDateUtcString(endDate)}
        onChange={e =>
          setDateRange(getMillisecondsFromUtcString(e.target.value), endDate)
        }
        type="date"
        value={getDateUtcString(startDate)}
      />
      {' — '}
      <Input
        isInvalid={endIsInvalid}
        max={getDateUtcString(max)}
        onChange={e =>
          setDateRange(startDate, getMillisecondsFromUtcString(e.target.value))
        }
        type="date"
        value={getDateUtcString(endDate)}
      />
    </InlineBlock>
  )
}

DateRangePicker.propTypes = {
  startDate: PropTypes.number.isRequired,
  endDate: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  setDateRange: PropTypes.func.isRequired,
}

export default DateRangePicker
