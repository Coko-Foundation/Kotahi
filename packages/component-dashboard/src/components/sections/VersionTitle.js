import React from 'react'
import styled from 'styled-components'
import { th } from '@pubsweet/ui'
// import {TitleViewer} from 'xpub-edit/src/components'

const Root = styled.div`
  flex: 1;
  font-size: ${th('fontSizeHeading3')};
`

export default ({ version, className }) => {
  // <TitleViewer
  //     value={version && version.metadata && version.metadata.title || 'Untitled'}
  //     className={className}/>

  const title =
    version && version.metadata && version.metadata.title
      ? version.metadata.title
      : 'Untitled'

  return <Root>{title}</Root>
}
