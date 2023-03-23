import React from 'react'
import { ManuscriptsHeaderRow, ManuscriptsTableStyled } from './style'
import FilterSortHeader from './FilterSortHeader'
import ManuscriptRow from './ManuscriptRow'
import {
  URI_PAGENUM_PARAM,
  URI_SORT_PARAM,
} from '../../../shared/urlParamUtils'
import { Placeholder } from '../../component-dashboard/src/style'
import { getNumVersions } from '../../component-dashboard/src/utils'

const ManuscriptsTable = ({
  applyQueryParams,
  manuscripts,
  columnsProps,
  sortDirection,
  sortName,
  getLink,
}) => {
  const setFilter = (name, value) =>
    applyQueryParams({
      [name]: value,
      [URI_PAGENUM_PARAM]: 1,
    })

  const setSort = (name, direction) =>
    applyQueryParams({
      [URI_SORT_PARAM]: `${name}_${direction}`,
      [URI_PAGENUM_PARAM]: 1,
    })

  return (
    <ManuscriptsTableStyled>
      <ManuscriptsHeaderRow>
        {columnsProps.map(info => (
          <FilterSortHeader
            columnInfo={info}
            key={info.name}
            setFilter={setFilter}
            setSort={setSort}
            sortDirection={sortDirection}
            sortName={sortName}
          />
        ))}
      </ManuscriptsHeaderRow>
      {manuscripts.length === 0 ? (
        <Placeholder>No matching manuscripts were found</Placeholder>
      ) : (
        manuscripts.map((manuscript, key) => {
          const latestVersion = {
            numVersions: getNumVersions(manuscript),
            ...(manuscript.manuscriptVersions?.[0] || manuscript),
          }

          return (
            <ManuscriptRow
              columnDefinitions={columnsProps}
              getLink={getLink}
              key={latestVersion.id}
              manuscript={latestVersion}
              setFilter={setFilter}
            />
          )
        })
      )}
    </ManuscriptsTableStyled>
  )
}

export default ManuscriptsTable
