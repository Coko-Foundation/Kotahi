import React from 'react'
import DatePicker from 'react-date-picker'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { getStartOfDayUtc, getEndOfDayUtc } from './dateUtils'

const InlineBlock = styled.div`
  display: inline-block;
`

const minDate = new Date('2020-01-01')

// max specifies the latest date allowed, but as the date-range returned extends until
// 23:59:59 UTC at the end of the endDate, it can overshoot max by some hours
const DateRangePicker = ({ endDate, max, setDateRange, startDate }) => {
  const trueMax = getEndOfDayUtc(max)
  const trueStart = getStartOfDayUtc(startDate)
  const trueEnd = getEndOfDayUtc(endDate)
  return (
    <InlineBlock>
      <DatePicker
        clearIcon={null}
        format="yyyy-MM-dd"
        maxDate={trueEnd}
        minDate={minDate}
        onChange={val =>
          setDateRange(getStartOfDayUtc(val).getTime(), trueEnd.getTime())
        }
        value={trueStart}
      />
      {' — '}
      <DatePicker
        clearIcon={null}
        format="yyyy-MM-dd"
        maxDate={trueMax}
        minDate={minDate}
        onChange={val => {
          let newStart = trueStart.getTime()
          const newEnd = getEndOfDayUtc(val).getTime()
          if (newStart >= newEnd) newStart = getStartOfDayUtc(newEnd).getTime()
          setDateRange(newStart, newEnd)
        }}
        value={trueEnd}
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
