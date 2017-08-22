import React from 'react'
import { Link } from 'react-router'
import classnames from 'classnames'
import classes from './AppBar.local.css'

const AppBar = ({ brandLink, brandName, loginLink, logoutLink, userName }) => (
  <div className={classes.root}>
    <Link to={brandLink || '/'}
          className={classes.link}>{brandName}</Link>

    <div>
      {userName && (
        <span className={classes.item}>{userName}</span>
      )}

      {userName ? (
        <Link to={logoutLink}
              className={classnames(classes.item, classes.link)}>logout</Link>
      ) : (
        <Link to={loginLink}
              className={classnames(classes.item, classes.link)}>login</Link>
      )}
    </div>
  </div>
)

export default AppBar
