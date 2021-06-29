import styled from 'styled-components'
import { Button, Action } from '@pubsweet/ui'
import ReactTooltip from 'rc-tooltip'

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

export const StyledButton = styled(Button)`
  cursor: pointer;
  margin: 0 20px;
`

export const UserAction = styled(Action)`
  cursor: pointer;
  display: block;
  font-size: inherit;
  opacity: ${({ isDisabled }) => (isDisabled ? '0.5' : '1')};
  width: fit-content;
`

export const ReactTooltipStyled = styled(ReactTooltip)`
  max-width: 80vw;
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
  cursor: ${process.env.INSTANCE_NAME === 'ncrc' ? 'pointer' : 'default'};
  border-radius: 7px;
  padding: 0 10px;
  text-align: center;
  white-space: nowrap;
`

export const StyledDescriptionWrapper = styled.div`
  align-items: center;
  display: flex;
`

export const BulkDeleteModalContainer = styled.div`
  background-color: white;
  padding: 10px;
`

export const BulkDeleteModalButtons = styled.div`
  display: flex;
  justify-content: space-between;
`

export const BulkDeleteModalButton = styled(Button)`
  cursor: pointer;
`
