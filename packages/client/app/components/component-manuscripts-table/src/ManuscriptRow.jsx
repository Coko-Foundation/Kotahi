/* eslint-disable react/prop-types */

import PropTypes from 'prop-types'
import 'rc-tooltip/assets/bootstrap_white.css'

import { useNavigate } from 'react-router-dom'
import { getFieldValueAndDisplayValue } from '../../../shared/manuscriptUtils'
import {
  Cell,
  ClickableManuscriptsRow,
  ManuscriptsRow,
  SnippetRow,
} from './style'

// ts_headline only ever wraps matches in <b>...</b>; every snippet source has any other HTML
// stripped before ts_headline runs (see stripHtmlTags in manuscriptUtils.js), so this is safe to
// parse and render as real elements instead of dangerouslySetInnerHTML.
const renderSnippetHtml = html =>
  html
    .split(/<\/?b>/)
    .map((part, index) =>
      index % 2 === 1 ? <mark key={index}>{part}</mark> : part,
    )

const ManuscriptRow = ({
  manuscript,
  columnDefinitions,
  setFilter,
  mainActionLink,
  archived,
}) => {
  const navigate = useNavigate()

  const rowCells = columnDefinitions.map(column => {
    const values = getFieldValueAndDisplayValue(column, manuscript)
    const Renderer = column.component
    return (
      <Cell
        $centered={column.centered}
        $flex={column.flex}
        data-testid={column.name}
        key={column.name}
        name={column.name}
      >
        <Renderer
          applyFilter={
            column.filterOptions && (val => setFilter(column.name, val))
          }
          manuscript={manuscript}
          values={values}
          {...column.extraProps}
        />
      </Cell>
    )
  })

  const searchSnippets = manuscript.searchSnippets?.length > 0 && (
    <>
      {manuscript.searchSnippets.map(({ field, html }) => (
        <SnippetRow key={field}>
          <strong>{field}:</strong> <span>{renderSnippetHtml(html)}</span>
        </SnippetRow>
      ))}
    </>
  )

  // Whole Row is clickable
  if (mainActionLink) {
    const onRowClick = () => navigate(mainActionLink)

    return (
      <>
        <ClickableManuscriptsRow
          $archived={archived}
          onClick={onRowClick}
          onKeyDown={e => e.key === 'Enter' && onRowClick()}
          role="button"
          tabIndex={0}
        >
          {rowCells}
        </ClickableManuscriptsRow>
        {searchSnippets}
      </>
    )
  }

  return (
    <>
      <ManuscriptsRow $archived={archived}>{rowCells}</ManuscriptsRow>
      {searchSnippets}
    </>
  )
}

ManuscriptRow.propTypes = {
  manuscript: PropTypes.shape({
    teams: PropTypes.arrayOf(PropTypes.object),
    created: PropTypes.string.isRequired,
    id: PropTypes.string,
    updated: PropTypes.string,
    status: PropTypes.string.isRequired,
    // Disabled because submission can have different fields

    submission: PropTypes.object.isRequired,
  }).isRequired,
  columnDefinitions: PropTypes.arrayOf(
    PropTypes.shape({
      /** The column name, corresponding either to a field name e.g. 'submission.$abstract' or to a special built-in column type */
      name: PropTypes.string.isRequired,
      /** Title to display in column heading */
      title: PropTypes.string.isRequired,
      /** Can this column be sorted? */
      canSort: PropTypes.bool.isRequired,
      /** 'ASC' or 'DESC' if this column is currently used to sort the table */
      sortDirection: PropTypes.string,
      /** The first sort direction to apply if the user opts to sort by this column */
      defaultSortDirection: PropTypes.string,
      /** The set of values that this column can be filtered by */
      filterOptions: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          value: PropTypes.string.isRequired,
        }).isRequired,
      ),
      /** If this column is currently used to filter the results, the filter value in use */
      filterValue: PropTypes.string,
      /** CSS flex attribute to use for sizing the column */
      flex: PropTypes.string.isRequired,
      /** The component to use for displaying a cell in this column */
      component: PropTypes.elementType.isRequired,
      /** Extra non-standard props to be supplied to the component */
      extraProps: PropTypes.shape({}),
    }).isRequired,
  ).isRequired,
  setFilter: PropTypes.func.isRequired,
}

export default ManuscriptRow
