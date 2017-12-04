import React from 'react'
import { withRouter } from 'react-router-dom'
import SimpleEditor from 'wax-editor-react'
import classes from './Manuscript.local.scss'

// TODO: convert user teams to roles (see SimpleEditorWrapper)?

const Manuscript = ({
  content,
  currentUser,
  fileUpload,
  history,
  updateManuscript,
}) => (
  <SimpleEditor
    classes={classes.fullscreen}
    content={content}
    fileUpload={fileUpload}
    history={history}
    onSave={source => updateManuscript({ source })}
    readOnly={false}
    trackChanges={false}
    update={data => updateManuscript(data)}
    user={currentUser}
  />
)

export default withRouter(Manuscript)
