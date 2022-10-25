import React, { useState } from 'react'
import styled from 'styled-components'
import Popup from 'reactjs-popup'
import { Calendar as CalendarIcon } from 'react-feather'
import { th, grid } from '@pubsweet/ui-toolkit'
import Calendar from './Calendar'
import { dateToIso8601 } from '../../shared/dateUtils'
import MinimalButton from './MinimalButton'

const MainContainer = styled.div`
  align-items: stretch;
  background: ${th('colorBackground')};
  border: 2px solid ${th('colorBorder')};
  box-shadow: ${th('boxShadow')};
  display: flex;
  gap: ${grid(1)};
  padding: ${grid(2)};
`

const DatePickerCalendar = ({ value: initialValue, minDate, onChange }) => {
  const [value, setValue] = useState(initialValue)

  return (
    <MainContainer>
      <Calendar
        minDate={minDate}
        minDetail="year"
        onClickDay={val => {
          setValue(val)
          onChange(val)
        }}
        value={value}
      />
    </MainContainer>
  )
}

const MinimalDatePicker = ({ value, minDate, onChange, position }) => {
  return (
    <Popup
      arrow={false}
      closeOnDocumentClick
      closeOnEscape
      on="click"
      position={position || 'bottom center'}
      trigger={open => (
        <div>
          <MinimalButton type="button">
            {dateToIso8601(value)}
            &nbsp;
            <CalendarIcon size={18} />
          </MinimalButton>
        </div>
      )}
    >
      {close => (
        <DatePickerCalendar
          minDate={new Date(minDate)}
          onChange={val => {
            onChange(val)
            close()
          }}
          value={new Date(value)}
        />
      )}
    </Popup>
  )
}

export default MinimalDatePicker
