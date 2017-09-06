import React from 'react'
import DashboardItemContainer from './DashboardItem'
import classes from './DashboardSection.local.scss'

const DashboardSection = ({ heading, projects, status, actions, links, meta, roles, empty }) => {
  if (!projects.length && !empty) return null

  return (
    <div className={classes.root}>
      <div className={classes.heading}>
        {heading}
      </div>

      {projects.length ? projects.map(project => (
        <div className={classes.item} key={project.id}>
          <DashboardItemContainer
            project={project}
            status={status}
            actions={actions}
            links={links}
            meta={meta}
            roles={roles}/>
        </div>
      )) : (
        <div className={classes.empty}>
          {empty()}
        </div>
      )}
    </div>
  )
}

export default DashboardSection
