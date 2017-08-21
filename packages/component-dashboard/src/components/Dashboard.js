import React from 'react'
import classes from './Dashboard.local.css'
import UploadManuscript from './UploadManuscript'
import DashboardItem from './DashboardItem'

const Dashboard = ({ projects, createProject, createVersion, convertToHTML, isConverting }) => (
  <div className={classes.root}>
    <div className={classes.upload}>
      <UploadManuscript
        createProject={createProject}
        createVersion={createVersion}
        convertToHTML={convertToHTML}/>
    </div>

    {projects.map(project => (
      <DashboardItem
        key={project.id}
        className={classes.item}
        project={project}/>
    ))}
  </div>
)

export default Dashboard
