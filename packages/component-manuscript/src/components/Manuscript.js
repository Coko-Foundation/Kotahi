import React from 'react'
import { browserHistory } from 'react-router'
import SimpleEditor from 'wax-editor-react'
import classes from './Manuscript.local.scss'

// TODO: convert user teams to roles (see SimpleEditorWrapper)?

const Manuscript = ({ project, version, currentUser, fileUpload, updateVersion }) => (
  <SimpleEditor
    classes={classes.fullscreen}
    content={version.source}
    user={currentUser}
    fileUpload={fileUpload}
    history={browserHistory}
    readOnly={false}
    trackChanges={false}
    update={data => (
      updateVersion(project, { id: version.id, ...data })
    )}
    onSave={source => (
      updateVersion(project, { id: version.id, source })
    )}
  />
)

export default Manuscript
