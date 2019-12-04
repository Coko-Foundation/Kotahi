import styled from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'

const Links = styled.div`
  align-items: flex-end;
  display: flex;
  justify-content: bottom;
`

const LinkContainer = styled.div`
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
`

export { Links, LinkContainer }
