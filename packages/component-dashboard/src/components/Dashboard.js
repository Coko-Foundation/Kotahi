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

const Dashboard = ({
  AssignEditor,
  currentUser,
  dashboard,
  conversion,
  deleteProject,
  reviewerResponse,
  uploadManuscript
}) => (
  <div className={classes.root}>
    <div className={classes.upload}>
      <UploadManuscript conversion={conversion} uploadManuscript={uploadManuscript} />
    </div>

    <div className={classes.section}>
      <div className={classes.heading}>My Submissions</div>

      {false ? (
        dashboard.owner.map(project => (
          <OwnerItemWithVersion key={project.id} project={project} deleteProject={deleteProject} />
        ))
      ) : (
        <EmptySubmissions
          conversion={conversion}
          uploadManuscript={uploadManuscript}
          text={`You haven't submitted any manuscripts yet.`}
        />
      )}
    </div>

    <div className={classes.section}>
      <div className={classes.heading}>To review</div>
      {!dashboard.reviewer.length ? (
        <EmptySubmissions text={`You have no manuscripts to review for now.`} />
      ) : (
        dashboard.reviewer.map(project => (
          <ReviewerItemWithVersion
            key={project.id}
            project={project}
            currentUser={currentUser}
            reviewerResponse={reviewerResponse}
          />
        ))
      )}
    </div>

    <div className={classes.section}>
      <div className={classes.heading}>Assign</div>
      {!dashboard.assign.length ? (
        <EmptySubmissions text={`Nu este nimic nici aici.`} />
      ) : (
        dashboard.assign.map(project => (
          <EditorItemWithVersion key={project.id} project={project} AssignEditor={AssignEditor} />
        ))
      )}
    </div>

    <div className={classes.section}>
      <div className={classes.heading}>My Manuscripts</div>
      {!dashboard.editor.length ? (
        <EmptySubmissions text={`You have no manuscripts.`} />
      ) : (
        dashboard.editor.map(project => (
          <EditorItemWithVersion key={project.id} project={project} AssignEditor={AssignEditor} />
        ))
      )}
    </div>
  </div>
)

export default Dashboard
