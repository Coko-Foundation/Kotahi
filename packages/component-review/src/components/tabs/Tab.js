import React from 'react'
import classes from './Tab.local.scss'
import classnames from 'classnames'

const Tab = ({ active, children }) => (
  <div
    className={classnames(classes.root, {
      [classes.active]: active,
    })}
  >
    {children}
  </div>
)

export default Tab
