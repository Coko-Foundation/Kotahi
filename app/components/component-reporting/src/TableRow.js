import React from 'react'
import styled, { css } from 'styled-components'
import PropTypes from 'prop-types'
import { th, lighten } from '@pubsweet/ui-toolkit'

const Row = styled.div`
  align-content: stretch;
  align-items: stretch;
  border: 1px solid ${lighten('colorBorder', 0.4)};
  border-bottom: none;
  display: flex;
  flex-direction: row;

  ${props =>
    props.isHeadingRow
      ? css`
          position: sticky;
          top: 0;
          z-index: 2;
        `
      : css`
          &:hover {
            box-shadow inset 0 0 4px ${th('colorPrimary')};
          }
        `}

  width: 100%;

  &:last-of-type {
    border-bottom: 1px solid ${lighten('colorBorder', 0.4)};
  }
`

const Cell = styled.div`
  border-right: 1px solid ${lighten('colorBorder', 0.4)};
  flex: ${props => props.flexGrow} 1 ${props => props.width};

  ${props =>
    props.isHeading &&
    css`
      background-color: ${lighten('colorPrimary', 0.8)};
      line-height: 120%;
    `}

  overflow-wrap: break-word;
  overflow-x: hidden;
  padding: 0.5em;

  &:last-child {
    border-right: none;
  }
`

const TableRow = ({ cells, isHeadingRow }) => {
  return (
    <Row isHeadingRow={isHeadingRow}>
      {cells.map((cell, index) => (
        <Cell
          flexGrow={cell.flexGrow ?? 0}
          isHeading={isHeadingRow || cell.isHeading}
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          width={cell.width}
        >
          {cell.content}
        </Cell>
      ))}
    </Row>
  )
}

TableRow.propTypes = {
  cells: PropTypes.arrayOf(
    PropTypes.shape({
      content: PropTypes.node.isRequired,
      flexGrow: PropTypes.number,
      isHeading: PropTypes.bool,
      width: PropTypes.string.isRequired,
    }).isRequired,
  ).isRequired,
  isHeadingRow: PropTypes.bool,
}

TableRow.defaultProps = {
  isHeadingRow: false,
}

export default TableRow
