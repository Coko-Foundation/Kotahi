import React from 'react'
import Status from '../Status'
import classes from './Item.local.scss'
import ProjectLink from '../ProjectLink'
import Divider from './Divider'
import VersionTitle from './VersionTitle'

const OwnerItem = ({ project, version, deleteProject }) => (
  <div className={classes.root}>
    <div className={classes.header}>
      <Status status={project.status}/>
    </div>

    <div className={classes.main}>
      <VersionTitle version={version} className={classes.title}/>

      <div className={classes.links}>
        <div className={classes.link}>
          <ProjectLink
            project={project}
            version={version}
            page="submit">Submission</ProjectLink>
        </div>

        <Divider separator="|"/>

        <div className={classes.link}>
          <ProjectLink
            project={project}
            version={version}
            page="manuscript">Manuscript</ProjectLink>
        </div>

        <Divider separator="|"/>

        <div className={classes.link}>
          <ProjectLink
            project={project}
            version={version}
            page="manuscript">Delete</ProjectLink>
        </div>

      </div>

      <div className={classes.actions}>
        <div className={classes.action}>
          <button onClick={() => deleteProject(project)}>x</button>
        </div>
      </div>
    </div>
  </div>
)

export default OwnerItem
