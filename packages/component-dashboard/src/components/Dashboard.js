import React from 'react'
import classes from './Dashboard.local.css'
import UploadManuscript from './UploadManuscript'
import DashboardItem from './DashboardItem'
import EmptySubmissions from './EmptySubmissions'
import DashboardSection from './DashboardSection'

const Dashboard = ({ projects, conversion, deleteProject, redirectToSubmit, uploadManuscript }) => (
  <div className={classes.root}>
    <div className={classes.upload}>
      <UploadManuscript
        conversion={conversion}
        uploadManuscript={uploadManuscript}/>
    </div>

    <DashboardSection
      heading="My Submissions"
      items={projects}
      empty={EmptySubmissions}>
      {projects.map(project => (
        <DashboardItem
          key={project.id}
          className={classes.item}
          project={project}
          deleteProject={deleteProject}/>
      ))}
    </DashboardSection>
  </div>
)

export default Dashboard
