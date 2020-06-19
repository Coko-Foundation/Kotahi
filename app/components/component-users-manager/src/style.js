import styled from 'styled-components'
import { Action } from '@pubsweet/ui'
import { th, grid } from '@pubsweet/ui-toolkit'

export const Table = styled.table`
  width: 100%;
  border-radius: ${th('borderRadius')};
  border-collapse: collapse;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  font-size: ${th('fontSizeBaseSmall')};

  td {
    width: 33%;
  }
`
export const Header = styled.thead`
  text-align: left;
  font-variant: all-small-caps;
  border-bottom: 1px solid ${th('colorFurniture')};

  background: ${th('colorBackgroundHue')};

  th {
    padding: ${grid(2)} ${grid(3)};
  }
`

export const Container = styled.div`
  padding: ${grid(2)};
`

export const Row = styled.tr`
  height: ${grid(6)};
  border-bottom: 1px solid ${th('colorFurniture')};
`

export const Cell = styled.td`
  padding: ${grid(2)} ${grid(3)};

  button {
    font-size: ${th('fontSizeBaseSmall')};
  }
`

export const UserCombo = styled.div`
  display: flex;
  line-height: ${grid(5)};
`

export const LastCell = styled(Cell)`
  text-align: right;
`
