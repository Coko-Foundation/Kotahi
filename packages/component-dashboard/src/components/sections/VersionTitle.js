import React from 'react'
import styled from 'styled-components'
// import {TitleViewer} from 'xpub-edit/src/components'

const Root = styled.div`
  flex: 1;
  font-size: var(--font-size-heading-3);
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
