/* eslint-disable react/destructuring-assignment */
import React from 'react'
import { Sidebar } from 'react-feather'

const PinButton = props => {
  return (
    <button type="submit" {...props}>
      <Sidebar />
      {props.children}
    </button>
  )
}

export default PinButton
