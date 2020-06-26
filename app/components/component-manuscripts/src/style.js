import styled, { css } from 'styled-components'
import { Action, Heading } from '@pubsweet/ui'
import { th, grid } from '@pubsweet/ui-toolkit'

export const Table = styled.table`
  width: 100%;
  border-radius: ${th('borderRadius')};
  border-collapse: collapse;
  font-size: ${th('fontSizeBaseSmall')};
  overflow: hidden;
  td {
    width: 25%;
  }
`

export const PageHeading = styled(Heading)`
  color: ${th('colorText')};
  margin-bottom: 1rem;
`

export const Content = styled.div`
  max-width: 90rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  background-color: ${th('colorBackground')};
  border-radius: ${th('borderRadius')};
`

export const Header = styled.thead`
  text-align: left;
  font-variant: all-small-caps;
  border-bottom: 1px solid ${th('colorFurniture')};

  background-color: ${th('colorSecondaryBackground')};

  th {
    padding: ${grid(1)} ${grid(3)};
  }
`

export const Container = styled.div`
  background: ${th('colorBackgroundHue')};
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

// TODO: Extract common above
// Specific

const Status = styled.span`
  border-radius: 8px;
  font-variant: all-small-caps;
  padding: ${grid(0.5)} ${grid(1)};
`
export const SuccessStatus = styled(Status)`
  background-color: ${th('colorSuccess')};
`

export const ErrorStatus = styled(Status)`
  background-color: ${th('colorError')};
`

export const NormalStatus = styled(Status)`
  background-color: ${th('colorWarning')};
  // color: ${th('colorTextReverse')};
`
