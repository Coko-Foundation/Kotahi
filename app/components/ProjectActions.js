import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'

import './ProjectActions.css'

const ProjectActions = ({ project }) => (
  <div className="project-actions content-metadata">
    {project.status === 'submitted' ? (
      <div>
        <div>
          <Link to={`/projects/${project.id}/editor`} className="project-action">assign an editor</Link>
        </div>

        <div>
          <Link to={`/projects/${project.id}/reviewers`} className="project-action">invite reviewers</Link>
        </div>
      </div>
    ) : (
      <div>
        <Link to={`/editor/${project.id}`} target="editor" className="project-action">edit your manuscript</Link>
      </div>
    )}
  </div>
)

ProjectActions.propTypes = {
  project: PropTypes.object.isRequired
}

export default ProjectActions
