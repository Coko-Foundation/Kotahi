import React from 'react'
import classes from './DashboardItem.local.css'
import { Link } from 'react-router'

const DashboardItem = ({ project, deleteProject }) => (
  <div className={classes.root}>
    <svg className={classes.indicator} viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="20"/>
    </svg>

    <div className={classes.title}>
      { project.title || 'Untitled' }
    </div>

    <div className={classes.status}>
      { project.submitted ? 'Submitted' : 'Unsubmitted' }
    </div>

    <div className={classes.link}>
      <Link to={`/projects/${project.id}/version/${project.fragments.length ? project.fragments[0] : null}/submit`}>Submission</Link>
    </div>

    <div className={classes.divider}>
      |
    </div>

    <div className={classes.link}>
      <Link to={`/projects/${project.id}/version/${project.fragments.length ? project.fragments[0] : null}/manuscript`}>Manuscript</Link>
    </div>

    <button onClick={() => deleteProject({id: project.id})}>x</button>
  </div>
)

export default DashboardItem
