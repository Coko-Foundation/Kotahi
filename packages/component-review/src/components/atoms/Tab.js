import styled from 'styled-components'
import { th } from '@pubsweet/ui'

const Tab = styled.div`
  padding: ${th('subGridUnit')} 1em;
  font-size: ${th('fontSizeBaseSmall')};
  border-width: 0 ${th('borderWidth')} ${th('borderWidth')} 0;
  border-style: ${th('borderStyle')};
  border-color: ${({ active, theme }) =>
    active ? theme.colorPrimary : theme.colorBorder};
`

export default Tab
