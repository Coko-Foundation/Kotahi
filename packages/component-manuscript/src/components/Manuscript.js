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
    user={currentUser}
    fileUpload={fileUpload}
    history={history}
    readOnly={false}
    trackChanges={false}
    update={data => updateManuscript(data)}
    onSave={source => updateManuscript({ source })}
  />
)

export default withRouter(Manuscript)
