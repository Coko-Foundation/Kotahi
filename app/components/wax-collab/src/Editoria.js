import React, { Fragment } from 'react'
import { Wax } from 'wax-prosemirror-core'
// import styled from 'styled-components'

import EditoriaLayout from './EditoriaLayout'

import { config } from './config'

// const StyledWax = styled(Wax)`
//   // .wax-surface-scroll {
//   //   height: ${props => (props.debug ? '50vh' : '100%')};
//   // }
// `

const renderImage = file => {
  const reader = new FileReader()
  return new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    // Some extra delay to make the asynchronicity visible
    setTimeout(() => reader.readAsDataURL(file), 150)
  })
}

const user = {
  userId: '1234',
  username: 'demo',
}

const Editoria = ({ content, readonly }) => (
  <Fragment>
    {/* <GlobalStyle /> */}
    <Wax
      autoFocus
      config={config}
      fileUpload={file => renderImage(file)}
      layout={EditoriaLayout}
      placeholder="Type Something..."
      readonly={readonly}
      user={user}
      // onChange={source => console.log(source)}
      value={content}
    />
  </Fragment>
)

export default Editoria
