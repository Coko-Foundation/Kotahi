import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'

import './ProjectActions.css'
import { Button } from 'react-bootstrap'

const ProjectActions = ({ project, approveSubmission }) => (
  <div className="project-actions content-metadata">
    {project.status === 'submitted' ? (
      <div>
        <div>
          <Button onClick={approveSubmission}>Approve submission</Button>
        </div>

        <div>
          <Link to={`/projects/${project.id}/editor`} className="project-action">assign an editor</Link>
        </div>

        <div>
          <Link to={`/projects/${project.id}/reviewers`} className="project-action">invite reviewers</Link>
        </div>
      </div>
    ) : (
      <div>
        <div>
          <Link to={`/editor/${project.id}`} target="editor" className="project-action">edit your manuscript</Link>
        </div>
        <div>
          <Link to={`/projects/${project.id}/declarations`} className="project-action">submit for publication</Link>
        </div>
      </div>
    )}
  </div>
)

ProjectActions.propTypes = {
  project: PropTypes.object.isRequired,
  approveSubmission: PropTypes.func
}

export default ProjectActions
