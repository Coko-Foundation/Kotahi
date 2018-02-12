import React from 'react'
import Status from '../Status'
import classes from './Item.local.scss'
import ProjectLink from '../ProjectLink'
import Divider from './Divider'
import VersionTitle from './VersionTitle'

const OwnerItem = ({ project, version, deleteProject }) => (
  <div className={classes.root}>
    <div className={classes.header}>
      <Status status={project.status} />
    </div>

    <div className={classes.main}>
      <VersionTitle className={classes.versionTitle} version={version} />

      <div className={classes.links}>
        <div className={classes.link}>
          <ProjectLink page="submit" project={project} version={version}>
            Summary info
          </ProjectLink>
        </div>

        <Divider separator="|" />

        <div className={classes.link}>
          <ProjectLink page="manuscript" project={project} version={version}>
            Manuscript
          </ProjectLink>
        </div>

        <Divider separator="|" />

        <div className={classes.link}>
          <a onClick={() => deleteProject(project)}>Delete</a>
        </div>
      </div>
    </div>
  </div>
)

export default OwnerItem
