import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'

import './Actions.css'

const ProjectActions = ({ project, approveSubmission }) => (
  <div className="actions content-metadata">
      <div className="action">
        <Link to={`/projects/${project.id}/editor`} className="project-action">assign an editor</Link>
      </div>

      <div className="action">
        <Link to={`/projects/${project.id}/reviewers`} className="project-action">invite reviewers</Link>
      </div>
  </div>
)

ProjectActions.propTypes = {
  project: PropTypes.object.isRequired,
  approveSubmission: PropTypes.func
}

export default ProjectActions
