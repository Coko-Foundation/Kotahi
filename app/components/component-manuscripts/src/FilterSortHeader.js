import React from 'react'
import { Cell, SortArrow } from './style'
import { Select } from '../../shared'

const FilterSortHeader = ({
  columnInfo,
  sortName,
  sortDirection,
  setSortName,
  setSortDirection,
  setFilter,
}) => {
  if (columnInfo.filterOptions && columnInfo.filterOptions.length > 1) {
    const options = [{ label: <i>All</i>, value: '' }].concat(
      columnInfo.filterOptions,
    )

    return (
      <Cell {...columnInfo}>
        <Select
          aria-label={columnInfo.title}
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
        {columnInfo.sortDirection && (
          <SortArrow direction={columnInfo.sortDirection} />
        )}
      </Cell>
    )
  }

  return <Cell {...columnInfo}>{columnInfo.title}</Cell>
}

export default FilterSortHeader
