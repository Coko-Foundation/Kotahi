import React from 'react'
import classes from './Dashboard.local.scss'
import UploadManuscript from './UploadManuscript'
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
  conversion,
  dashboard,
  deleteProject,
  reviewerResponse,
  uploadManuscript
}) => (
  <div className={classes.root}>
    <div className={classes.upload}>
      <UploadManuscript conversion={conversion} uploadManuscript={uploadManuscript} />
    </div>

    {!dashboard.owner.length &&
      !dashboard.reviewer.length &&
      !dashboard.assign.length &&
      !dashboard.editor.length && (
        <div className={classes.section}>
          <div className={classes.empty}>Nothing to do at the moment. Please upload a document.</div>
        </div>
      )}

    {!!dashboard.owner.length && (
      <div className={classes.section}>
        <div className={classes.heading}>My Submissions</div>
        {dashboard.owner.map(project => (
          <OwnerItemWithVersion key={project.id} project={project} deleteProject={deleteProject} />
        ))}
      </div>
    )}

    {!!dashboard.reviewer.length && (
      <div className={classes.section}>
        <div className={classes.heading}>To review</div>
        {dashboard.reviewer.map(project => (
          <ReviewerItemWithVersion
            key={project.id}
            project={project}
            currentUser={currentUser}
            reviewerResponse={reviewerResponse}
          />
        ))}
      </div>
    )}

    {!!dashboard.assign.length && (
      <div className={classes.section}>
        <div className={classes.heading}>Assign</div>
        {dashboard.assign.map(project => (
          <EditorItemWithVersion key={project.id} project={project} AssignEditor={AssignEditor} />
        ))}
      </div>
    )}

    {!!dashboard.editor.length && (
      <div className={classes.section}>
        <div className={classes.heading}>My Manuscripts</div>
        {dashboard.editor.map(project => (
          <EditorItemWithVersion key={project.id} project={project} AssignEditor={AssignEditor} />
        ))}
      </div>
    )}
  </div>
)

export default Dashboard
