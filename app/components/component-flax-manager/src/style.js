import styled from 'styled-components'

export const Section = styled.div`
  margin: 16px;
`

export const Legend = styled.div`
  font-weight: 600;
  margin-bottom: ${({ space, theme }) => space && theme.gridUnit};
`

export const Page = styled.div`
  position: relative;
  z-index: 0;
`

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
} from '../../shared'
