import React from 'react'
import { Link } from 'react-router-dom'
import classnames from 'classnames'
import classes from './AppBar.local.scss'
import Icon from '../atoms/Icon'

const AppBar = ({ brandLink, brandName, loginLink, logoutLink, userName }) => (
  <div className={classes.root}>
    <Link
      to={brandLink || '/'}
      className={classnames(classes.link, classes.logo)}
    >
      {brandName}
    </Link>

    <div>
      {userName && (
        <span className={classes.item}>
          <Icon size={16}>user</Icon>
          <span className={classes.username}>{userName}</span>
        </span>
      )}

      {userName ? (
        <Link
          to={logoutLink}
          className={classnames(classes.item, classes.link)}
        >
          logout
        </Link>
      ) : (
        <Link to={loginLink} className={classnames(classes.item, classes.link)}>
          login
        </Link>
      )}
    </div>
  </div>
)

export default AppBar
