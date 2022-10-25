import styled from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'

export const ControlLabel = styled.div`
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
`

export const CompactDetailLabel = styled.div`
  color: ${props => th(props.isWarning ? 'colorError' : 'colorBorder')};
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('fontSizeBaseSmall')};
`
