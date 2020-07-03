import styled from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'

export const Section = styled.div`
  margin: calc(${th('gridUnit')} * 6) 0;
`

export const Legend = styled.div`
  font-size: ${th('fontSizeBase')};
  font-weight: 600;
  margin-bottom: ${({ space, theme }) => space && theme.gridUnit};
`
