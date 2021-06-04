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

export const InfoIcon = styled.div`
  background-color: #7cbff9;
  border-radius: 50%;
  color: white;
  height: 25px;
  margin-left: 11px;
  min-height: 25px;
  min-width: 25px;
  text-align: center;
  width: 25px;
`

export const SelectAllField = styled.div`
  align-items: center;
  display: flex;
  margin-top: 10px;
`
export const SelectedManuscriptsNumber = styled.p`
  font-weight: bold;
  margin-left: 10px;
  margin-right: 15px;
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

export const StyledAuthor = styled.p`
  white-space: nowrap;
`

export const StyledTableLabel = styled.p`
  background-color: #ccc;
  border-radius: 7px;
  padding: 0 10px;
  text-align: center;
  white-space: nowrap;
`

export const StyledDescriptionWrapper = styled.div`
  align-items: center;
  display: flex;
`
