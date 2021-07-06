/* eslint-disable react/prop-types */

import React from 'react'
import styled from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'
import { get } from 'lodash'

const Root = styled.div`
  line-height: ${th('lineHeightHeading4')};
`

export default ({ version, className }) => {
  const title =
    process.env.INSTANCE_NAME === 'ncrc'
      ? JSON.parse(version.submission).articleDescription
      : get(version, 'meta.title') || 'Untitled'

  return <Root>{title}</Root>
}
