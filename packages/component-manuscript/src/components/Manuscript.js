import React from 'react'
import { browserHistory } from 'react-router'
import SimpleEditor from 'wax-editor-react'
import classes from './Manuscript.local.scss'

// TODO: convert user teams to roles (see SimpleEditorWrapper)?

const Manuscript = ({ content, currentUser, fileUpload, updateManuscript }) => (
  <SimpleEditor
    classes={classes.fullscreen}
    content={content}
    user={currentUser}
    fileUpload={fileUpload}
    history={browserHistory}
    readOnly={false}
    trackChanges={false}
    update={data => updateManuscript(data)}
    onSave={source => updateManuscript({ source })}
  />
)

export default Manuscript
