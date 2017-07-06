import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'

import './VersionActions.css'

const VersionActions = ({ project, version }) => (
  <div className="version-actions">
    <div>
      <Link to={`/editor/${project.id}/${version.id}`} target="editor"
            className="version-action">{version.submitted ? 'view your manuscript' : 'edit your manuscript'}</Link>
    </div>

    <div>
      <Link to={`/projects/${project.id}/declarations`}
            className="version-action">{version.submitted ? 'view declarations' : 'submit for peer review'}</Link>
    </div>

    <div style={{marginTop: 20}}>
      <Link to={`/projects/${project.id}/review`}
            className="version-action">submit your review</Link>
    </div>

    <div>
      <Link to={`/projects/${project.id}/decision`}
            className="version-action">submit your decision</Link>
    </div>
  </div>
)

VersionActions.propTypes = {
  project: PropTypes.object.isRequired,
  version: PropTypes.object.isRequired
}

export default VersionActions
