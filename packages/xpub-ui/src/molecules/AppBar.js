import React from 'react'
import { Link } from 'react-router-dom'
import classnames from 'classnames'
import classes from './AppBar.local.scss'
import Icon from '../atoms/Icon'

const AppBar = ({ brandLink, brandName, loginLink, logoutLink, userName }) => (
  <div className={classes.root}>
    <Link
      className={classnames(classes.link, classes.logo)}
      to={brandLink || '/'}
    >
      {brandName}
    </Link>

    <div className={classes.actions}>
      {userName && (
        <span className={classes.item}>
          <Icon size={16}>user</Icon>
          <span className={classes.username}>{userName}</span>
        </span>
      )}

      {userName ? (
        <Link
          className={classnames(classes.item, classes.link)}
          to={logoutLink}
        >
          logout
        </Link>
      ) : (
        <Link className={classnames(classes.item, classes.link)} to={loginLink}>
          login
        </Link>
      )}
    </div>
  </div>
)

export default AppBar
