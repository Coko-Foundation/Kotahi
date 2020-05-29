import React, { Fragment } from 'react'
import { Wax } from 'wax-prosemirror-core'
import styled, { createGlobalStyle } from 'styled-components'

import EditoriaLayout from './EditoriaLayout'

import { config } from './config'

const StyledWax = styled(Wax)`
  // .wax-surface-scroll {
  //   height: ${props => (props.debug ? '50vh' : '100%')};
  // }
`

const renderImage = file => {
  const reader = new FileReader()
  return new Promise((accept, fail) => {
    reader.onload = () => accept(reader.result)
    reader.onerror = () => fail(reader.error)
    // Some extra delay to make the asynchronicity visible
    setTimeout(() => reader.readAsDataURL(file), 150)
  })
}

const user = {
  userId: '1234',
  username: 'demo',
}

const Editoria = () => (
  <Fragment>
    {/* <GlobalStyle /> */}
    <Wax
      autoFocus
      config={config}
      fileUpload={file => renderImage(file)}
      layout={EditoriaLayout}
      // value={"this is some content"}
      placeholder="Type Something..."
      // onChange={source => console.log(source)}
      user={user}
    />
  </Fragment>
)

export default Editoria
