/* eslint-disable react/prop-types */

import React from 'react'
import styled from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'

const Root = styled.div`
  line-height: ${th('lineHeightHeading4')};
`

export default ({ version, className }) => {
  const title =
    version && version.meta && version.meta.title
      ? version.meta.title
      : 'Untitled'

  return <Root>{title}</Root>
}
