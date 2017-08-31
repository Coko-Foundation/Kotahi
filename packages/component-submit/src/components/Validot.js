import React from 'react'
import classnames from 'classnames'
import classes from './Validot.local.css'

// TODO: use the parent validots node instead of document
// TODO: highlight the scrolled-to element
const scrollIntoView = id => document.getElementById(id).scrollIntoView()

const Validot = ({ input, meta }) => (
  <svg
    className={classnames(classes.root, {
      [classes.valid]: meta.valid,
      [classes.error]: meta.error,
      [classes.warning]: meta.warning,
    })}
    onClick={() => scrollIntoView(input.name)}
    viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="20"/>
  </svg>
)

export default Validot
