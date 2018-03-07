import React from 'react'
import { withRouter } from 'react-router-dom'
import SimpleEditor from 'wax-editor-react'

// TODO: convert user teams to roles (see SimpleEditorWrapper)?

const Manuscript = ({
  content,
  currentUser,
  fileUpload,
  history,
  updateManuscript,
  version,
}) => (
  <SimpleEditor
    content={content}
    fileUpload={fileUpload}
    history={history}
    onSave={source => updateManuscript({ source })}
    readOnly={version.submitted}
    trackChanges={false}
    update={data => updateManuscript(data)}
    user={currentUser}
  />
)

export default withRouter(Manuscript)
