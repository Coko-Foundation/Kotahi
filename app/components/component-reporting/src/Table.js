import React from 'react'
import PropTypes from 'prop-types'
import TableRow from './TableRow'

const Table = ({ columnSchemas, rows }) => {
  const hasHeadings = columnSchemas.some(col => !!col.heading)
  return (
    <div>
      {hasHeadings && (
        <TableRow
          cells={columnSchemas.map(col => ({
            ...col,
            content: col.heading,
          }))}
          isHeadingRow
        />
      )}
      {rows.map((row, index) => (
        <TableRow
          cells={row.map((cell, i) => {
            return cell.content
              ? { ...cell, ...columnSchemas[i] }
              : { content: cell, ...columnSchemas[i] }
          })}
          key={row.key ?? index}
        />
      ))}
    </div>
  )
}

Table.propTypes = {
  columnSchemas: PropTypes.arrayOf(
    PropTypes.shape({
      flexGrow: PropTypes.number,
      heading: PropTypes.node,
      width: PropTypes.string.isRequired,
    }).isRequired,
  ),
  rows: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string.isRequired,
        PropTypes.number.isRequired,
        PropTypes.node.isRequired,
        PropTypes.shape({
          content: PropTypes.node.isRequired,
          isHeading: PropTypes.bool,
        }).isRequired,
      ]).isRequired,
    ).isRequired,
  ).isRequired,
}
Table.defaultProps = {
  columnSchemas: [],
}

export default Table
