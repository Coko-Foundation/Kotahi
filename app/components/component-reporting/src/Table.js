import React from 'react'
import PropTypes from 'prop-types'
import TableRow from './TableRow'

const Table = ({ headings, rows, sizings }) => {
  return (
    <div>
      {headings && (
        <TableRow
          cells={headings.map((content, i) => ({
            content,
            ...sizings[i],
          }))}
          isHeadingRow
        />
      )}
      {rows.map((row, index) => (
        <TableRow
          cells={row.map((cell, i) => ({ ...cell, ...sizings[i] }))}
          // eslint-disable-next-line react/no-array-index-key
          key={index}
        />
      ))}
    </div>
  )
}

Table.propTypes = {
  sizings: PropTypes.arrayOf(
    PropTypes.shape({
      flexGrow: PropTypes.number,
      width: PropTypes.string.isRequired,
    }).isRequired,
  ).isRequired,
  headings: PropTypes.arrayOf(PropTypes.node.isRequired),
  rows: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        content: PropTypes.node.isRequired,
        isHeading: PropTypes.bool,
      }).isRequired,
    ).isRequired,
  ).isRequired,
}
Table.defaultProps = {
  headings: null,
}

export default Table
