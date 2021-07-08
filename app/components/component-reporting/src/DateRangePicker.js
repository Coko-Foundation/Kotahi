import React from 'react'
import DatePicker from 'react-date-picker'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import {
  getStartOfDayUtc,
  getEndOfDayUtc,
  transposeUtcToLocal,
  transposeLocalToUtc,
} from './dateUtils'

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
        maxDate={transposeUtcToLocal(trueEnd)}
        minDate={transposeUtcToLocal(minDate)}
        onChange={val =>
          setDateRange(
            getStartOfDayUtc(transposeLocalToUtc(val)).getTime(),
            trueEnd.getTime(),
          )
        }
        value={transposeUtcToLocal(trueStart)}
      />
      {' — '}
      <DatePicker
        clearIcon={null}
        format="yyyy-MM-dd"
        maxDate={transposeUtcToLocal(trueMax)}
        minDate={transposeUtcToLocal(minDate)}
        onChange={val => {
          let newStart = trueStart.getTime()
          const newEnd = getEndOfDayUtc(transposeLocalToUtc(val)).getTime()
          if (newStart >= newEnd) newStart = getStartOfDayUtc(newEnd).getTime()
          setDateRange(newStart, newEnd)
        }}
        value={transposeUtcToLocal(trueEnd)}
      />
    </InlineBlock>
  )
}

DateRangePicker.propTypes = {
  /** Number (ms since epoch), string or Date object: Start date will be the UTC date containing this date-time  */
  startDate: PropTypes.oneOfType([
    PropTypes.number.isRequired,
    PropTypes.string.isRequired,
    PropTypes.object.isRequired,
  ]).isRequired,
  /** Number (ms since epoch), string or Date object: End date will be the UTC date containing this date-time  */
  endDate: PropTypes.oneOfType([
    PropTypes.number.isRequired,
    PropTypes.string.isRequired,
    PropTypes.object.isRequired,
  ]).isRequired,
  /** Number (ms since epoch), string or Date object: The UTC date containing this date-time specifies the maximum end date */
  max: PropTypes.oneOfType([
    PropTypes.number.isRequired,
    PropTypes.string.isRequired,
    PropTypes.object.isRequired,
  ]).isRequired,
  /** callback with params (newStart, newEnd). newStart is midnight UTC at beginning of start date; newEnd is midnight UTC at end of end date. */
  setDateRange: PropTypes.func.isRequired,
}

export default DateRangePicker
