/* stylelint-disable declaration-block-no-redundant-longhand-properties */

import styled from 'styled-components'
import { th, grid } from '@coko/client'

export const Table = styled.table`
  border-collapse: collapse;
  border-radius: ${th('borderRadius')};
  font-size: ${th('fontSizeBaseSmall')};
  margin-top: ${grid(4)};
  table-layout: fixed;
  width: 100%;

  td {
    width: 25%;
  }
`

export const Header = styled.thead`
  background-color: ${th('colorSecondaryBackground')};
  border-bottom: 1px solid ${th('colorFurniture')};
  font-variant: all-small-caps;
  line-height: 1.25em;
  text-align: left;

  th {
    padding: ${grid(2)} ${grid(6)};
  }
`

export const Row = styled.tr`
  border-bottom: 1px solid ${th('colorFurniture')};
  max-height: ${grid(16)};

  &:hover {
    background-color: ${th('colorBackgroundHue')};
  }
`

export const Cell = styled.td`
  ${({ minWidth }) => minWidth && `min-width: ${minWidth}`};
  padding: calc(${grid(4)} - 1px) ${grid(6)} ${grid(4)} ${grid(6)};

  button {
    font-size: ${th('fontSizeBaseSmall')};
  }
`

export const LastCell = styled(Cell)`
  text-align: right;
`
