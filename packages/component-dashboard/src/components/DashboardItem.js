import React from 'react'
import Status from './Status'
import classes from './DashboardItem.local.scss'

const DashboardItem = ({ project, version, actions, links, meta, roles, status = true }) => (
  <div className={classes.root}>
    <div className={classes.header}>
      {status && <Status status={project.status}/>}

      {meta && (
        <div className={classes.meta}>
          {meta(project, version).map((item, index) => [
            index === 0 ? null : <span className={classes.divider}>{' - '}</span>,
            <div key={item.key}>
              {item.content}
            </div>
          ])}
        </div>
      )}
    </div>

    <div className={classes.main}>
      <div className={classes.title}>
        { project.title || 'Untitled' }
      </div>

      {links && (
        <div className={classes.links}>
          {links(project, version).map((item, index) => [
            index === 0 ? null : <span className={classes.divider}> | </span>,
            <div className={classes.link} key={item.key}>
              {item.content}
            </div>
          ])}
        </div>
      )}

      {actions && (
        <div className={classes.actions}>
          {actions(project, version).map((item, index) => [
            index === 0 ? null : <span className={classes.divider}> | </span>,
            <div className={classes.action} key={item.key}>
              {item.content}
            </div>
          ])}
        </div>
      )}
    </div>

    {roles && (
      <div className={classes.roles}>
        {roles(project, version).map((item, index) => [
          <div className={classes.role} key={item.key}>
            {item.content}
          </div>
        ])}
      </div>
    )}
  </div>
)

export default DashboardItem
