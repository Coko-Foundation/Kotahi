import styled from 'styled-components'
import { th } from '@pubsweet/ui'

export const Heading1 = styled.h1`
  margin: 0 0 ${th('gridUnit')};
  font-size: ${th('fontSizeHeading1')};
`

export const Section = styled.div`
  margin: calc(${th('gridUnit')} * 2) 0;
`

export const Legend = styled.div`
  font-size: ${th('fontSizeBase')};
  font-weight: 600;
  margin-bottom: ${({ space, theme }) => space && theme.subGridUnit};
`
