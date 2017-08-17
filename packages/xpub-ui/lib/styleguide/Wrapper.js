import React from 'react'
// import { Router, createMemoryHistory } from 'react-router'
import 'xpub-fonts'
import './Wrapper.scss'
import classes from './Wrapper.local.css'

/*const Wrapper = ({ children }) => (
  <Router history={createMemoryHistory()}>
    <div className={classes.root}>
      {children}
    </div>
  </Router>
)*/

const Wrapper = ({ children }) => (
  <div className={classes.root}>
    {children}
  </div>
)

export default Wrapper
