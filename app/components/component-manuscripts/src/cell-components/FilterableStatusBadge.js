import React from 'react'
import { StatusBadge } from '../../../shared'

const FilterableStatusBadge = ({ manuscript, applyFilter }) => (
  /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  <span onClick={() => applyFilter(manuscript.status)}>
    <StatusBadge
      clickable
      published={manuscript.published}
      status={manuscript.status}
    />
  </span>
)

export default FilterableStatusBadge
