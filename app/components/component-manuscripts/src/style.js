import styled from 'styled-components'
import { Action } from '@pubsweet/ui'
import { th, grid } from '@pubsweet/ui-toolkit'

export {
  Row,
  Cell,
  LastCell,
  UserCombo,
  Primary,
  Secondary,
  UserInfo,
  Container,
  Table,
  Header,
  Content,
  PageHeading,
  Carets,
  CaretUp,
  CaretDown,
  Spinner,
  Pagination,
} from '../../shared'

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

export const UserAction = styled(Action)`
  font-size: inherit;
`
