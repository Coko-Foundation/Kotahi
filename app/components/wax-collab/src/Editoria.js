import React from 'react'
import { Wax } from 'wax-prosemirror-core'
import EditoriaLayout from './EditoriaLayout'
import { config } from './config'

// const renderImage = file => {
//   const reader = new FileReader()
//   return new Promise((resolve, reject) => {
//     reader.onload = () => resolve(reader.result)
//     reader.onerror = () => reject(reader.error)
//     // Some extra delay to make the asynchronicity visible
//     setTimeout(() => reader.readAsDataURL(file), 150)
//   })
// }

const user = {
  userId: '1234',
  username: 'demo',
}

const Editoria = ({ content, readonly }) => (
  <>
    <Wax
      autoFocus
      config={config}
      // fileUpload={file => renderImage(file)}
      layout={EditoriaLayout(readonly)}
      placeholder="Type Something..."
      readonly={readonly}
      user={user}
      // onChange={source => console.log(source)}
      value={content}
    />
  </>
)

export default Editoria
