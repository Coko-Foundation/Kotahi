import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'

import './Actions.css'

const VersionActions = ({ project, version }) => (
  <div className="actions">
    <div className="action">
      <Link to={`/editor/${project.id}/${version.id}`} target="editor">{version.snapshot ? 'view your manuscript' : 'edit your manuscript'}</Link>
    </div>

    <div className="action">
      <Link to={`/projects/${project.id}/declarations`}>{version.snapshot ? 'view declarations' : 'edit declarations'}</Link>
    </div>

    <div className="action">
      <Link to={`/projects/${project.id}/check`}>check submission</Link>
    </div>

    <div className="action">
      <Link to={`/projects/${project.id}/submit`}>submit for peer review</Link>
    </div>

    <div className="action">
      <Link to={`/projects/${project.id}/submit`}>publish preprint</Link>
    </div>

    <div className="action">
      <Link to={`/projects/${project.id}/review`}>submit your review</Link>
    </div>

    <div className="action">
      <Link to={`/projects/${project.id}/decision`}>submit your decision</Link>
    </div>
  </div>
)

VersionActions.propTypes = {
  project: PropTypes.object.isRequired,
  version: PropTypes.object.isRequired
}

export default VersionActions
