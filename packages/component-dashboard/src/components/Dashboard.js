import React from 'react'
import classes from './Dashboard.local.scss'
import UploadManuscript from './UploadManuscript'
import OwnerSection from './sections/OwnerSection'
import ReviewerSection from './sections/ReviewerSection'
import EditorSection from './sections/EditorSection'

const projectRoute = (project, page) => `/projects/${project.id}/version/${project.fragments[0]}/${page}`

const Dashboard = ({ journal, dashboard, conversion, deleteProject, reviewerResponse, uploadManuscript }) => (
  <div className={classes.root}>
    <div className={classes.upload}>
      <UploadManuscript
        conversion={conversion}
        uploadManuscript={uploadManuscript}/>
    </div>

    <OwnerSection
      projects={dashboard.owner}
      deleteProject={deleteProject}
      projectRoute={projectRoute}/>

    <ReviewerSection
      projects={dashboard.reviewer}
      reviewerResponse={reviewerResponse}
      projectRoute={projectRoute}/>

    <EditorSection
      journal={journal}
      projects={dashboard.editor}
      projectRoute={projectRoute}/>
  </div>
)

export default Dashboard
