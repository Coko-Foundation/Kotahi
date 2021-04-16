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
  ScrollableContent,
  ManuscriptsTable,
} from '../../shared'

// TODO: Extract common above
// Specific

export const UserAction = styled(Action)`
  cursor: pointer;
  display: block;
  font-size: inherit;
  width: fit-content;
`

export const StyledTopic = styled.p`
  background-color: red;
  border-radius: 7px;
  color: white;
  cursor: pointer;
  margin-bottom: 5px;
  max-width: 150px;
  overflow: hidden;
  padding: 0 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: fit-content;
`

export const StyledTableLabel = styled.p`
  background-color: #ccc;
  border-radius: 7px;
  padding: 0 10px;
  text-align: center;
  white-space: nowrap;
`
