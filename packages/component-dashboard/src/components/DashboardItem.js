import React from 'react'
import classes from './DashboardItem.local.css'
import { Link } from 'react-router'

const DashboardItem = ({ project }) => (
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
      <Link to={`/projects/${project.id}/submit`}>Submission</Link>
    </div>

    <div className={classes.divider}>
      |
    </div>

    <div className={classes.link}>
      <Link to={`/projects/${project.id}/manuscript`}>Manuscript</Link>
    </div>
  </div>
)

export default DashboardItem
