/* stylelint-disable string-quotes */

import styled from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'

const Meta = styled.div`
  display: flex;
  flex-wrap: nowrap;
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
  white-space: nowrap;

  > :not(:last-child)::after {
    content: '-';
  }
`

export default Meta
