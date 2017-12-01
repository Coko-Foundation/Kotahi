import React from 'react'
// import {TitleViewer} from 'xpub-edit/src/components'

export default ({version, className}) => {
  // <TitleViewer
  //     value={version && version.metadata && version.metadata.title || 'Untitled'}
  //     className={className}/>

  const title = version && version.metadata && version.metadata.title
    ? version.metadata.title
    : 'Untitled'

  return (
    <div className={className}>
      {title}
    </div>
  )
}