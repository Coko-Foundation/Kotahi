import React from 'react'
import classes from './Dashboard.local.scss'
import UploadManuscript from './UploadManuscript'
import OwnerSection from './sections/OwnerSection'
import ReviewerSection from './sections/ReviewerSection'
import EditorSection from './sections/EditorSection'

const Dashboard = ({ dashboard, conversion, deleteProject, reviewerResponse, uploadManuscript }) => (
  <div className={classes.root}>
    <div className={classes.upload}>
      <UploadManuscript
        conversion={conversion}
        uploadManuscript={uploadManuscript}/>
    </div>

    <OwnerSection
      projects={dashboard.owner}
      deleteProject={deleteProject}/>

    <ReviewerSection
      projects={dashboard.reviewer}
      reviewerResponse={reviewerResponse}/>

    <EditorSection
      projects={dashboard.editor}/>
  </div>
)

export default Dashboard
