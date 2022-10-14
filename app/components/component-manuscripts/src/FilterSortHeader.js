import React from 'react'
import styled from 'styled-components'
import Popup from 'reactjs-popup'
import { ArrowUp, ArrowDown, Calendar as FeatherCalendar } from 'react-feather'
import { th, grid } from '@pubsweet/ui-toolkit'
import { Cell, HeadingCell } from './style'
import { Select, DateRangeCalendar } from '../../shared'
import {
  dateToCompactStringLocal,
  compactStringToDateLocal,
} from '../../../shared/dateUtils'

const SortUp = styled(ArrowUp)`
  height: ${grid(2)};
  stroke: ${th('colorBorder')};
  width: ${grid(2)};

  &:hover {
    stroke: ${th('colorPrimary')};
  }
`

const SortDown = styled(ArrowDown)`
  height: ${grid(2)};
  stroke: ${th('colorBorder')};
  width: ${grid(2)};

  &:hover {
    stroke: ${th('colorPrimary')};
  }
`

const CalendarIcon = styled(({ isActive, ...props }) => (
  <FeatherCalendar {...props} />
))`
  height: ${grid(2)};
  stroke: ${props => th(props.isActive ? 'colorPrimary' : 'colorBorder')};
  width: ${grid(2)};

  &:hover {
    stroke: ${th('colorPrimary')};
  }
`

const IconButton = styled.button`
  background: none;
  border: none;
  display: flex;
  padding: 0 2px;
`

const getDateRangeFromFilterString = filterString => {
  if (!filterString) return []
  const parts = filterString.split('-')
  if (parts.length !== 2) return []

  try {
    const startDate = compactStringToDateLocal(parts[0])
    const endDate = compactStringToDateLocal(parts[1])
    return [startDate, endDate]
  } catch (e) {
    console.error(`Could not parse date range '${filterString}'`)
    return []
  }
}

const FilterSortHeader = ({
  columnInfo,
  sortName,
  sortDirection,
  setSortName,
  setSortDirection,
  setFilter,
}) => {
  if (columnInfo.canFilterByDateRange) {
    const changeSort = () => {
      const priorSortName = sortName
      setSortName(columnInfo.name)

      if (priorSortName !== columnInfo.name) {
        setSortDirection(columnInfo.defaultSortDirection)
      } else if (sortDirection === 'ASC') {
        setSortDirection('DESC')
      } else if (sortDirection === 'DESC') {
        setSortDirection('ASC')
      }
    }

    const filterByDateRange = range => {
      if (range?.length === 2) {
        setFilter(
          columnInfo.name,
          `${dateToCompactStringLocal(range[0])}-${dateToCompactStringLocal(
            range[1],
          )}`,
        )
      } else setFilter(columnInfo.name, null)
    }

    return (
      <HeadingCell onClick={changeSort} {...columnInfo}>
        {
          '\u200B' /* zero-width space so the layout engine understands where the baseline is */
        }
        <Popup
          arrow={false}
          closeOnDocumentClick
          closeOnEscape
          on="click"
          position="bottom center"
          trigger={open => (
            <IconButton type="button">
              <CalendarIcon isActive={!!columnInfo.filterValue} />
            </IconButton>
          )}
        >
          {close => (
            <DateRangeCalendar
              onChange={range => {
                filterByDateRange(range)
                close()
              }}
              value={getDateRangeFromFilterString(columnInfo.filterValue)}
            />
          )}
        </Popup>

        {columnInfo.title}
        {columnInfo.sortDirection === 'ASC' && <SortDown />}
        {columnInfo.sortDirection === 'DESC' && <SortUp />}
      </HeadingCell>
    )
  }

  if (columnInfo.filterOptions && columnInfo.filterOptions.length > 1) {
    const options = [{ label: <i>All</i>, value: '' }].concat(
      columnInfo.filterOptions,
    )

    return (
      <Cell {...columnInfo} style={{ overflow: 'visible' }}>
        <Select
          aria-label={columnInfo.title}
          customStyles={{
            control: provided => ({
              ...provided,
              minHeight: 'unset',
            }),
            dropdownIndicator: provided => ({
              ...provided,
              padding: '0 2px 0 0',
            }),
            indicatorSeparator: provided => ({
              ...provided,
              display: 'none',
            }),
            placeholder: provided => ({
              ...provided,
              margin: 0,
            }),
            valueContainer: provided => ({
              ...provided,
              padding: '0 6px',
            }),
          }}
          data-testid={columnInfo.name}
          label={columnInfo.title}
          onChange={selected => setFilter(columnInfo.name, selected.value)}
          options={options}
          placeholder={columnInfo.title}
          value={columnInfo.filterValue}
        />
      </Cell>
    )
  }

  if (columnInfo.canSort) {
    const changeSort = () => {
      const priorSortName = sortName
      setSortName(columnInfo.name)

      if (priorSortName !== columnInfo.name) {
        setSortDirection(columnInfo.defaultSortDirection)
      } else if (sortDirection === 'ASC') {
        setSortDirection('DESC')
      } else if (sortDirection === 'DESC') {
        setSortDirection('ASC')
      }
    }

    return (
      <Cell onClick={changeSort} {...columnInfo}>
        {columnInfo.title}
        {columnInfo.sortDirection === 'ASC' && <SortDown />}
        {columnInfo.sortDirection === 'DESC' && <SortUp />}
      </Cell>
    )
  }

  return <Cell {...columnInfo}>{columnInfo.title}</Cell>
}

export default FilterSortHeader
