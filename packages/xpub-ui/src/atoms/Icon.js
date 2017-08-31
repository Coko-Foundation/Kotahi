import React from 'react'
import { pascalize } from 'humps'
import * as icons from 'react-feather'

const Icon = ({ children, color = 'black', size = 24 }) => {
  // convert `arrow_left` to `ArrowLeft`
  const name = pascalize(children)

  // select the icon
  const icon = icons[name]

  return (
    <span>{icon({ color, size })}</span>
  )
}

export default Icon
