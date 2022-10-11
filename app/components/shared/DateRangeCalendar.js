import React, { useState } from 'react'
import Calendar from 'react-calendar'
import styled from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'
import MinimalButton from './MinimalButton'
import ActionButton from './ActionButton'
import lightenBy from '../../shared/lightenBy'
import { Title } from './General'

const StyledCalendar = styled(Calendar)`
  border: none;

  & .react-calendar__navigation {
    background-color: ${th('colorBackgroundHue')};
    display: flex;
    font-size: ${th('fontSizeSmall')};
    height: ${grid(4)};
    justify-content: center;
    line-height: ${th('lineHeightSmall')};
    margin-bottom: 0;
  }

  & .react-calendar__navigation button:focus {
    background: none;
  }

  & .react-calendar__month-view__weekdays {
    font-size: ${th('fontSizeSmall')};
    line-height: ${th('lineHeightSmall')};
  }

  & .react-calendar__tile {
    border-radius: ${grid(2)};
    box-sizing: border-box;
  }

  & .react-calendar__tile--now {
    background: none;
    border: 1px solid ${lightenBy('colorPrimary', 0.2)};
  }

  & .react-calendar__tile--active {
    background: ${th('colorPrimary')};
    color: inherit;
  }

  & .react-calendar__tile--hasActive,
  & .react-calendar__tile--hasActive:focus {
    background: ${lightenBy('colorPrimary', 0.7)};
  }

  & .react-calendar__tile--active:enabled:focus,
  & .react-calendar__tile--active:enabled:hover,
  & .react-calendar__tile--hasActive:hover {
    background: ${th('colorPrimary')};
  }

  & .react-calendar__tile--range,
  & .react-calendar__tile--hover {
    background: ${lightenBy('colorPrimary', 0.7)};
    border-radius: 0;
  }

  & .react-calendar__tile--hover:hover {
    background: ${lightenBy('colorPrimary', 0.7)};
  }

  &
    .react-calendar__tile--rangeStart:not(.react-calendar__tile--hover:not(.react-calendar__tile--hoverStart)),
  & .react-calendar__tile--hoverStart {
    border-bottom-left-radius: ${grid(2)};
    border-top-left-radius: ${grid(2)};
  }

  &
    .react-calendar__tile--rangeEnd:not(.react-calendar__tile--hover:not(.react-calendar__tile--hoverEnd)),
  & .react-calendar__tile--hoverEnd {
    border-bottom-right-radius: ${grid(2)};
    border-top-right-radius: ${grid(2)};
  }
`

const MainContainer = styled.div`
  align-items: stretch;
  background: ${th('colorBackground')};
  border: 2px solid ${th('colorBorder')};
  box-shadow: ${th('boxShadow')};
  display: flex;
  gap: ${grid(1)};
  padding: ${grid(2)};
`

const LeftControls = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

const PresetsContainer = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${grid(0.5)};
`

const VerticalDivider = styled.div`
  border-left: 2px solid ${th('colorFurniture')};
  margin: ${grid(1)};
  width: 0;
`

const DateRangeCalendar = ({
  /** An array of two Dates: [startDate, endDate]; or null. The two dates can be the same, to specify a single day. */
  value,
  onChange,
}) => {
  const [dateRange, setDateRange] = useState(value?.length === 2 ? value : [])

  const applyOffsetRange = (startOffsetDays, endOffsetDays) => {
    const start = new Date(Date.now() + startOffsetDays * 24 * 60 * 60 * 1000)
    const end = new Date(Date.now() + endOffsetDays * 24 * 60 * 60 * 1000)
    setDateRange([start, end])
    onChange([start, end])
  }

  return (
    <MainContainer>
      <LeftControls>
        <PresetsContainer>
          <Title>Presets</Title>
          <MinimalButton onClick={() => applyOffsetRange(0, 0)}>
            Today
          </MinimalButton>
          <MinimalButton onClick={() => applyOffsetRange(-1, -1)}>
            Yesterday
          </MinimalButton>
          <MinimalButton onClick={() => applyOffsetRange(-7, 0)}>
            Past 7 days
          </MinimalButton>
          <MinimalButton onClick={() => applyOffsetRange(-30, 0)}>
            Past 30 days
          </MinimalButton>
          <MinimalButton onClick={() => applyOffsetRange(-90, 0)}>
            Past 90 days
          </MinimalButton>
          <MinimalButton
            onClick={() =>
              /* Probably OK if it's a day out on leap years */
              applyOffsetRange(-365, 0)
            }
          >
            Past year
          </MinimalButton>
        </PresetsContainer>
        <ActionButton
          isCompact
          onClick={() => {
            setDateRange([])
            onChange(null)
          }}
          primary
        >
          Clear
        </ActionButton>
      </LeftControls>
      <VerticalDivider />
      <StyledCalendar
        minDetail="year"
        onClickDay={val => {
          const newDateRange =
            dateRange.length < 2 ? [...dateRange, val] : [val]

          newDateRange.sort((a, b) => a.getTime() - b.getTime())
          setDateRange(newDateRange)
          if (newDateRange.length === 2) onChange(newDateRange)
        }}
        selectRange
        value={dateRange.length ? dateRange : null}
      />
    </MainContainer>
  )
}

export default DateRangeCalendar
