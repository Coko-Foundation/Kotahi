import React from 'react'
import classes from './Dashboard.local.scss'
import UploadManuscript from './UploadManuscript'
import EmptySubmissions from './EmptySubmissions'
import withVersion from './withVersion'
import EditorItem from './sections/EditorItem'
import OwnerItem from './sections/OwnerItem'
import ReviewerItem from './sections/ReviewerItem'

const OwnerItemWithVersion = withVersion(OwnerItem)
const EditorItemWithVersion = withVersion(EditorItem)
const ReviewerItemWithVersion = withVersion(ReviewerItem)

const Dashboard = ({ dashboard, conversion, deleteProject, reviewerResponse, uploadManuscript }) => (
  <div className={classes.root}>
    <div className={classes.upload}>
      <UploadManuscript
        conversion={conversion}
        uploadManuscript={uploadManuscript}/>
    </div>

    <div className={classes.section}>
      <div className={classes.heading}>
        My Submissions
      </div>

      {dashboard.owner ? (
        dashboard.owner.map(project => (
          <OwnerItemWithVersion
            key={project.id}
            project={project}
            deleteProject={deleteProject}/>
        ))
      ) : (
        <EmptySubmissions/>
      )}
    </div>

    {!!dashboard.reviewer.length && (
      <div className={classes.section}>
        <div className={classes.heading}>
          My Reviews
        </div>

        {dashboard.reviewer.map(project => (
          <ReviewerItemWithVersion
            key={project.id}
            project={project}
            reviewerResponse={reviewerResponse}/>
        ))}
      </div>
    )}

    {!!dashboard.assign.length && (
      <div className={classes.section}>
        <div className={classes.heading}>
          Assign
        </div>

        {dashboard.assign.map(project => (
          <EditorItemWithVersion
            key={project.id}
            project={project}/>
        ))}
      </div>
    )}

    {!!dashboard.editor.length && (
      <div className={classes.section}>
        <div className={classes.heading}>
          My Manuscripts
        </div>

        {dashboard.editor.map(project => (
          <EditorItemWithVersion
            key={project.id}
            project={project}/>
        ))}
      </div>
    )}
  </div>
)

export default Dashboard
