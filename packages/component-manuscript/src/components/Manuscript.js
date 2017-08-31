import React from 'react'
import { browserHistory } from 'react-router'
import SimpleEditor from 'pubsweet-component-wax/src/SimpleEditor'
import classes from './Manuscript.local.css'

// TODO: convert user teams to roles (see SimpleEditorWrapper)?

const Manuscript = ({ project, version, currentUser, fileUpload, updateVersion }) => (
  <SimpleEditor
    classes={classes.fullscreen}
    book={project}
    fragment={version}
    user={currentUser}
    fileUpload={fileUpload}
    history={browserHistory}
    update={data => (
      updateVersion(project, { id: version.id, ...data })
    )}
    onSave={source => (
      updateVersion(project, { id: version.id, source })
    )}
  />
)

export default Manuscript
