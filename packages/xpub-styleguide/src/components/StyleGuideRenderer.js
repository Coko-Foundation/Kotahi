import React from 'react'
import classes from './StyleGuideRenderer.local.scss'

const StyleGuideRenderer = ({ title, children, toc }) => {
  return (
    <div className={classes.root}>
      <div className={classes.sidebar}>
        <header className={classes.header}>
          <h1 className={classes.title}>{title}</h1>
        </header>

        <nav className={classes.nav}>{toc}</nav>
      </div>

      <div className={classes.content}>{children}</div>
    </div>
  )
}

export default StyleGuideRenderer
