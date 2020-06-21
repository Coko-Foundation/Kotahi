import styled, { css } from 'styled-components'
import { Action } from '@pubsweet/ui'
import { th, grid } from '@pubsweet/ui-toolkit'

export const Table = styled.table`
  width: 100%;
  border-radius: ${th('borderRadius')};
  border-collapse: collapse;
  font-size: ${th('fontSizeBaseSmall')};

  td {
    width: 33%;
  }
`
export const Header = styled.thead`
  text-align: left;
  font-variant: all-small-caps;
  border-bottom: 1px solid ${th('colorFurniture')};

  background-color: ${th('colorBackgroundHue')};

  th {
    padding: ${grid(1)} ${grid(3)};
  }
`

export const Container = styled.div`
  padding: ${grid(2)};
`

export const Row = styled.tr`
  max-height: ${grid(8)};
  border-bottom: 1px solid ${th('colorFurniture')};

  &:hover {
    background-color: ${th('colorBackgroundHue')};
  }
`

export const Cell = styled.td`
  padding-bottom: ${grid(2)};
  padding-top: calc(${grid(2)} - 1px);
  padding-left: ${grid(3)};
  padding-right: ${grid(3)};
  button {
    font-size: ${th('fontSizeBaseSmall')};
  }
`

export const UserCombo = styled.div`
  display: flex;
  line-height: ${grid(2.5)};
  align-items: center;
`

export const LastCell = styled(Cell)`
  text-align: right;
`

export const Primary = styled.div`
  font-weight: 500;
`

export const Secondary = styled.div`
  color: ${th('colorTextPlaceholder')};
`

export const UserInfo = styled.div`
  margin-left: ${grid(1)};
`
