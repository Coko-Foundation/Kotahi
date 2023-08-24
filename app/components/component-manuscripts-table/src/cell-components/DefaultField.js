import React from 'react'
import styled, { css } from 'styled-components'
import { LabelBadge } from '../../../shared'

const CellItem = styled.div`
  display: inline-block;
  margin: 0.1em;
  ${props =>
    props.onClick &&
    css`
      cursor: pointer;
    `}
`

/** Display all values. If applyFilter is defined, filter by that value on click.
 * For string values, if a color is specified, display the value as a colored badge. */
const DefaultField = ({ values, applyFilter }) =>
  values.map(v => {
    const clickAction = applyFilter ? () => applyFilter(v.value) : null

    if (typeof v.displayValue === 'object') {
      // eslint-disable-next-line no-console
      console.log(
        'This object cannot be displayed in the table. Check "columns to display on the Manuscripts page" in Kotahi configuration.',
        v.displayValue,
      )
      return null
    }

    if (typeof v.displayValue !== 'string') return v.displayValue // So displayValue can be a React component
    return (
      <CellItem key={v.value} onClick={clickAction}>
        {v.color ? (
          <LabelBadge color={v.color}>{v.displayValue}</LabelBadge>
        ) : (
          v.displayValue
        )}
      </CellItem>
    )
  })

export default DefaultField
