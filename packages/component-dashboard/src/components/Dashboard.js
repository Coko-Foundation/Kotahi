import React from 'react'
import classes from './Dashboard.local.css'
import UploadManuscript from './UploadManuscript'
import DashboardItem from './DashboardItem'
import EmptySubmissions from './EmptySubmissions'
import DashboardSection from './DashboardSection'

const Dashboard = ({ projects, createProject, createVersion, convertToHTML, isConverting }) => (
  <div className={classes.root}>
    <div className={classes.upload}>
      <UploadManuscript
        createProject={createProject}
        createVersion={createVersion}
        convertToHTML={convertToHTML}/>
    </div>

    <DashboardSection
      heading="My Submissions"
      items={projects}
      empty={EmptySubmissions}>
      {projects.map(project => (
        <DashboardItem
          key={project.id}
          className={classes.item}
          project={project}/>
      ))}
    </DashboardSection>
  </div>
)

export default Dashboard
