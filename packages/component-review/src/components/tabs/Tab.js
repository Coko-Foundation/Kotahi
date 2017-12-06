import classnames from 'classnames'
import React from 'react'

import classes from './Tab.local.scss'

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
