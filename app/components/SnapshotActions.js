import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'

import './SnapshotActions.css'

const SnapshotActions = ({ project, snapshot }) => (
  <div className="snapshot-actions">
    <div>
      <Link to={`/editor/${project.id}/${snapshot.id}`} target="editor"
            className="snapshot-action">{snapshot.submitted ? 'view your manuscript' : 'edit your manuscript'}</Link>
    </div>

    <div>
      <Link to={`/projects/${project.id}/declarations`}
            className="snapshot-action">{snapshot.submitted ? 'view declarations' : 'submit for peer review'}</Link>
    </div>

    <div style={{marginTop: 20}}>
      <Link to={`/projects/${project.id}/review`}
            className="snapshot-action">submit your review</Link>
    </div>

    <div>
      <Link to={`/projects/${project.id}/decision`}
            className="snapshot-action">submit your decision</Link>
    </div>
  </div>
)

SnapshotActions.propTypes = {
  project: PropTypes.object.isRequired,
  snapshot: PropTypes.object.isRequired
}

export default SnapshotActions
