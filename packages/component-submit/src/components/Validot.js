import React from 'react'
import classnames from 'classnames'
import classes from './Validot.local.scss'

// TODO: use the parent validots node instead of document
// TODO: highlight the scrolled-to element
const scrollIntoView = id => document.getElementById(id).scrollIntoView()

const Validot = ({ input, meta, message }) => (
  <div
    className={classnames(classes.root, {
      [classes.valid]: meta.valid,
      [classes.error]: meta.error,
      [classes.warning]: meta.warning,
    })}
    message={message}
    onClick={() => scrollIntoView(input.name)}/>
)

export default Validot
