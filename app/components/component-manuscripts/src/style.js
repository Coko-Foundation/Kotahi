import styled from 'styled-components'
import { Action } from '@pubsweet/ui'

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
  Heading,
  Carets,
  CaretUp,
  CaretDown,
  Spinner,
  Pagination,
  SuccessStatus,
  ErrorStatus,
  NormalStatus,
  StatusBadge,
} from '../../shared'

// TODO: Extract common above
// Specific

export const UserAction = styled(Action)`
  font-size: inherit;
`

export const StyledTopic = styled.p`
  background-color: red;
  padding: 0 10px;
  margin-bottom: 5px;
  border-radius: 7px;
  color: white;
  width: fit-content;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 150px;
`

export const StyledTableLabel = styled.p`
  background-color: #ccc;
  padding: 0 10px;
  text-align: center;
  border-radius: 7px;
  white-space: nowrap;
`