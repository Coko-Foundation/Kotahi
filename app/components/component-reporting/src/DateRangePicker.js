import React from 'react'
import styled, { css } from 'styled-components'
import PropTypes from 'prop-types'
import { th, lighten } from '@pubsweet/ui-toolkit'
import { getStartOfDayUtc, getEndOfDayUtc, getDateUtcString } from './dateUtils'

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

// max specifies the latest date allowed, but as the date-range returned extends until
// 23:59:59 UTC at the end of the endDate, it can overshoot max by some hours
const DateRangePicker = ({ endDate, max, setDateRange, startDate }) => {
  const trueMax = getEndOfDayUtc(max)
  const trueStart = getStartOfDayUtc(startDate)
  const trueEnd = getEndOfDayUtc(endDate)
  const endIsInvalid = trueEnd > trueMax
  const startIsInvalid = trueStart > trueMax || trueStart > trueEnd
  return (
    <InlineBlock>
      <Input
        isInvalid={startIsInvalid}
        max={getDateUtcString(trueEnd)}
        onChange={e =>
          setDateRange(
            getStartOfDayUtc(e.target.value).getTime(),
            trueEnd.getTime(),
          )
        }
        type="date"
        value={getDateUtcString(trueStart)}
      />
      {' — '}
      <Input
        isInvalid={endIsInvalid}
        max={getDateUtcString(trueMax)}
        onChange={e => {
          let newStart = trueStart.getTime()
          const newEnd = getEndOfDayUtc(e.target.value).getTime()
          if (newStart >= newEnd) newStart = getStartOfDayUtc(newEnd).getTime()
          setDateRange(newStart, newEnd)
        }}
        type="date"
        value={getDateUtcString(trueEnd)}
      />
    </InlineBlock>
  )
}

DateRangePicker.propTypes = {
  startDate: PropTypes.oneOfType([
    PropTypes.number.isRequired,
    PropTypes.string.isRequired,
    PropTypes.object.isRequired,
  ]).isRequired,
  endDate: PropTypes.oneOfType([
    PropTypes.number.isRequired,
    PropTypes.string.isRequired,
    PropTypes.object.isRequired,
  ]).isRequired,
  max: PropTypes.oneOfType([
    PropTypes.number.isRequired,
    PropTypes.string.isRequired,
    PropTypes.object.isRequired,
  ]).isRequired,
  setDateRange: PropTypes.func.isRequired,
}

export default DateRangePicker
